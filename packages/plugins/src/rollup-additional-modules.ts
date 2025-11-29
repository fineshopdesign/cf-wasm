import { existsSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative } from 'node:path';
import MagicString from 'magic-string';
import type { Plugin } from 'rollup';
import { inlineModuleRenderers, nodeModuleRenderers } from './renderers';
import {
  type AdditionalModulesBaseOptions,
  createModuleReference,
  isModuleReference,
  type ModuleType,
  matchModule,
  moduleReferenceMatchGlobalRE,
} from './shared';
import { cleanUrl, hashString } from './utils';

interface Replacement {
  chunkName: string;
  chunkFileName: string;
  chunkFileNames: string[];
  moduleType: ModuleType;
  assetImport: string;
  assetFileName: string;
  prebuiltChunkImport: string;
  prebuiltChunkFileName: string;
  fromImport: string;
  toImport: string;
}

interface ReferenceData {
  name: string;
  type: ModuleType;
  path: string;
  assetId?: string;
  chunkId: string;
}

export interface AdditionalModulesOptions extends AdditionalModulesBaseOptions {
  dev?: boolean;
  assetsDir?: string;
}

export default function additionalModules(options: AdditionalModulesOptions = {}): Plugin {
  const { target = 'workerd', cleanup = true } = options;

  const replacements: Replacement[] = [];
  const references = new Map<string, ReferenceData>();

  const ctx = {} as {
    outDir?: string;
  };

  return {
    name: 'cf-wasm:rollup-plugin:additional-modules',

    resolveId: {
      order: 'pre',
      async handler(source) {
        if (isModuleReference(source)) {
          return {
            id: source,
            external: true,
          };
        }
      },
    },

    load: {
      order: 'pre',
      async handler(id) {
        const module = matchModule(id);

        if (!module) {
          return;
        }

        const { type: moduleType, extension: moduleExtension } = module;
        const modulePath = cleanUrl(id);

        let data: Buffer;

        try {
          data = await readFile(modulePath);
        } catch (error) {
          throw new Error(`Module "${modulePath}" not found. Does the file exists?`, {
            cause: error,
          });
        }

        const inlineModuleLoader = inlineModuleRenderers[moduleType];
        const inlineModule = inlineModuleLoader(data);

        if (options.dev) {
          return inlineModule;
        }

        const hash = hashString(data.toString('base64'));
        const assetName = `${basename(modulePath).split('.')[0]}.${hash}${moduleExtension}`;
        const assetFileName = join(options.assetsDir || 'assets', assetName);

        let assetId: string | undefined;
        if (target !== 'inline' && (target !== 'edge-light' || moduleType === 'CompiledWasm')) {
          assetId = this.emitFile({
            type: 'asset',
            fileName: assetFileName,
            source: data,
          });
        }

        let chunkId: string;
        if (target === 'node') {
          const nodeModuleLoader = nodeModuleRenderers[moduleType];
          const nodeModule = nodeModuleLoader(`./${assetName}`);

          chunkId = this.emitFile({
            type: 'prebuilt-chunk',
            fileName: `${assetFileName}.node.mjs`,
            code: nodeModule,
          });
        } else {
          chunkId = this.emitFile({
            type: 'prebuilt-chunk',
            fileName: `${assetFileName}.inline.mjs`,
            code: inlineModule,
          });
        }

        references.set(assetName, {
          name: assetName,
          type: moduleType,
          path: modulePath,
          assetId,
          chunkId,
        });

        return `export { default } from ${JSON.stringify(createModuleReference(assetName))};`;
      },
    },

    async renderChunk(code, chunk) {
      if (options.dev) {
        return;
      }

      if (!chunk.moduleIds.some((id) => isModuleReference(id)) && !chunk.imports.some((id) => isModuleReference(id))) {
        return;
      }

      const replaced = new MagicString(code);
      const final = new MagicString(code);

      for (const match of code.matchAll(moduleReferenceMatchGlobalRE)) {
        const index = match.index;
        const len = match[0].length;
        const referenceKey = match[1];
        const reference = references.get(referenceKey);

        if (!index || !reference) {
          return;
        }

        const { type: moduleType, assetId, chunkId } = reference;

        const prebuiltChunkFileName = this.getFileName(chunkId);
        const prebuiltChunkRelativePath = relative(dirname(chunk.fileName), prebuiltChunkFileName);
        const prebuiltChunkImport = `./${prebuiltChunkRelativePath.replaceAll('\\', '/')}`; // fix windows paths for import

        if (assetId && (target === 'workerd' || target === 'edge-light')) {
          const assetFileName = this.getFileName(assetId);
          const assetRelativePath = relative(dirname(chunk.fileName), assetFileName);
          const assetImport = `./${assetRelativePath.replaceAll('\\', '/')}`; // fix windows paths for import

          let toImport = prebuiltChunkImport;

          if (target === 'edge-light') {
            if (moduleType === 'CompiledWasm') {
              // https://vercel.com/docs/functions/runtimes/wasm
              toImport = `${assetImport}?module`;
            }
          } else {
            // https://developers.cloudflare.com/workers/wrangler/bundling/#including-non-javascript-modules
            toImport = assetImport;
          }

          const replacement: Replacement = {
            chunkName: chunk.name,
            chunkFileName: chunk.fileName,
            chunkFileNames: [],
            moduleType,
            assetImport,
            assetFileName,
            prebuiltChunkImport,
            prebuiltChunkFileName,
            fromImport: prebuiltChunkImport,
            toImport,
          };
          replacements.push(replacement);

          final.overwrite(index, index + len, replacement.toImport);
        } else {
          final.overwrite(index, index + len, prebuiltChunkImport);
        }

        replaced.overwrite(index, index + len, prebuiltChunkImport);
      }

      if (replaced.hasChanged()) {
        return {
          code: replaced.toString(),
          map: final.generateMap({ includeContent: true }),
        };
      }
    },

    async generateBundle(_, bundle) {
      const replacementsByChunkName = new Map<string, Replacement[]>();

      for (const replacement of replacements) {
        const chunkReplacements = replacementsByChunkName.get(replacement.chunkName) || [];
        if (!chunkReplacements.length) {
          replacementsByChunkName.set(replacement.chunkName, chunkReplacements);
        }
        chunkReplacements.push(replacement);
      }

      for (const chunk of Object.values(bundle)) {
        if (!chunk.name) {
          continue;
        }
        const chunkReplacements = replacementsByChunkName.get(chunk.name);
        if (!chunkReplacements) {
          continue;
        }
        for (const replacement of chunkReplacements) {
          replacement.chunkFileNames.push(chunk.fileName);
        }
      }
    },

    renderStart(outputOptions) {
      ctx.outDir = outputOptions.dir;
    },

    async writeBundle() {
      if (target !== 'workerd' && target !== 'edge-light') {
        return;
      }

      const outDir = ctx.outDir;

      if (!outDir) {
        throw new Error('Failed to detect output directory.');
      }

      const replacementsByFileName = new Map<string, Replacement[]>();
      for (const replacement of replacements) {
        for (const fileName of replacement.chunkFileNames) {
          const repls = replacementsByFileName.get(fileName) || [];
          if (!repls.length) {
            replacementsByFileName.set(fileName, repls);
          }
          repls.push(replacement);
        }
      }

      for (const [fileName, repls] of replacementsByFileName.entries()) {
        const filepath = join(outDir, fileName);
        const contents = await readFile(filepath, 'utf-8');

        let updated = contents;
        for (const replacement of repls) {
          if (replacement.fromImport === replacement.toImport) {
            continue;
          }

          updated = updated.replaceAll(replacement.fromImport, replacement.toImport);

          const prebuiltChunkPath = join(outDir, replacement.prebuiltChunkFileName);
          if (cleanup && existsSync(prebuiltChunkPath)) {
            await rm(prebuiltChunkPath);
          }
        }

        await writeFile(filepath, updated, 'utf-8');
      }
    },
  };
}
