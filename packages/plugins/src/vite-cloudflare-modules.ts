/*!
 * Inspired from: https://github.com/withastro/astro/blob/main/packages/integrations/cloudflare/src/utils/cloudflare-module-loader.ts [MIT]
 */

import * as fsp from 'node:fs/promises';
import * as path from 'node:path';
import stringify from 'fast-json-stable-stringify';
import type { Plugin, ResolvedConfig } from 'vite';

function cleanUrl(url: string) {
  return url.replace(/[?#].*$/, '');
}

/**
 * Returns a deterministic 32 bit hash code from a string
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32bit integer
  }
  return new Uint32Array([hash])[0].toString(36);
}

const MODULE_TYPES = ['CompiledWasm', 'Data', 'Text'] as const;
type ModuleType = (typeof MODULE_TYPES)[number];

const moduleReferencePattern = '____CF_WASM:CLOUDFLARE_MODULE__(.*?)__CF_WASM:CLOUDFLARE_MODULE____';
const moduleReferenceRE = new RegExp(`^${moduleReferencePattern}$`);
const moduleReferenceMatchGlobalRE = new RegExp(moduleReferencePattern, 'g');

interface ModuleRule {
  type: ModuleType;
  extensions: string[];
}

const moduleRules: ModuleRule[] = [
  { type: 'CompiledWasm', extensions: ['.wasm', '.wasm?module'] },
  { type: 'Data', extensions: ['.bin'] },
  { type: 'Text', extensions: ['.txt'] },
];

const moduleExtensions = [...new Set(moduleRules.flatMap((r) => r.extensions.map((e) => cleanUrl(e))))];

function matchModule(source: string) {
  for (const rule of moduleRules) {
    for (const ext of rule.extensions) {
      if (source.endsWith(ext)) {
        return {
          type: rule.type,
          extension: cleanUrl(ext),
        };
      }
    }
  }

  return null;
}

interface ModuleReferenceData {
  type: ModuleType;
  assetId: string;
}

function createModuleReference(data: ModuleReferenceData) {
  return `____CF_WASM:CLOUDFLARE_MODULE__${encodeURIComponent(stringify(data))}__CF_WASM:CLOUDFLARE_MODULE____`;
}

const inlineModuleRenderers: Record<ModuleType, (contents: Buffer) => string> = {
  CompiledWasm(fileContents) {
    const base64 = fileContents.toString('base64');
    return `const wasmModule = new WebAssembly.Module(Uint8Array.from(atob("${base64}"), c => c.charCodeAt(0))); export default wasmModule;`;
  },
  Data(fileContents) {
    const base64 = fileContents.toString('base64');
    return `const binModule = Uint8Array.from(atob("${base64}"), c => c.charCodeAt(0)).buffer; export default binModule;`;
  },
  Text(fileContents) {
    const escaped = JSON.stringify(fileContents.toString('utf-8'));
    return `const stringModule = ${escaped}; export default stringModule;`;
  },
};

interface Replacement {
  chunkName: string;
  chunkFileName: string;
  fileNames: string[];
  moduleType: ModuleType;
  cloudflareImport: string;
  cloudflareFileName: string;
  nodejsImport: string;
  nodejsFileName: string;
}

export type Runtime = 'node' | 'workerd';

export interface CloudflareModulesOptions {
  runtime?: Runtime;
}

export default function cloudflareModules({ runtime = 'workerd' }: CloudflareModulesOptions = {}): Plugin {
  const ctx = {
    isDev: false,
  } as {
    viteConfig: ResolvedConfig;
    isDev: boolean;
    outDir: string;
    assetsDir: string;
  };

  const replacements: Replacement[] = [];

  return {
    name: 'cf-wasm:cloudflare-modules',
    enforce: 'pre',

    config() {
      // let vite know that file format and the magic import string is intentional, and will be handled in this plugin

      return {
        assetsInclude: moduleExtensions.map((e) => `**/*${e}`),
        build: {
          rollupOptions: {
            external: moduleReferenceRE,
          },
        },
      };
    },

    configResolved(config) {
      ctx.viteConfig = config;
      ctx.isDev = config.command === 'serve';
      ctx.outDir = config.build.outDir;
      ctx.assetsDir = config.build.assetsDir;
    },

    async load(id) {
      const module = matchModule(id);

      if (!module) {
        return;
      }

      const { type: moduleType, extension: moduleExtension } = module;
      const modulePath = cleanUrl(id);

      let data: Buffer;

      try {
        data = await fsp.readFile(modulePath);
      } catch (error) {
        throw new Error(`Import "${modulePath}" not found. Does the file exists?`, {
          cause: error,
        });
      }

      const inlineModuleLoader = inlineModuleRenderers[moduleType as ModuleType];
      const inlineModule = inlineModuleLoader(data);

      if (ctx.isDev) {
        // no need to wire up the assets in dev mode, just rewrite
        return inlineModule;
      }

      const hash = hashString(data.toString('base64'));
      // emit the cloudflare module binary as an asset file, to be picked up later by the esbuild bundle for the worker.
      // give it a shared deterministic name to make things easy for esbuild to switch on later
      const assetName = `${path.basename(modulePath).split('.')[0]}.${hash}${moduleExtension}`;
      const assetFileName = path.join(ctx.assetsDir, assetName);

      const assetId = this.emitFile({
        type: 'asset',
        // emit the data explicitly as an esset with `fileName` rather than `name` so that
        // vite doesn't give it a random hash-id in its name--We need to be able to easily rewrite from
        // the .mjs loader and the actual module asset later in the esbuild for the worker
        fileName: assetFileName,
        source: data,
      });

      // however, by default, the SSG generator cannot import the cloudflare module as an es module, so embed as a base64 string
      this.emitFile({
        type: 'prebuilt-chunk',
        fileName: `${assetFileName}.inline.mjs`,
        code: inlineModule,
      });

      const referenceData: ModuleReferenceData = {
        type: moduleType,
        assetId,
      };

      return `export { default } from "${createModuleReference(referenceData)}";`;
    },

    async renderChunk(code, chunk) {
      if (ctx.isDev) {
        return;
      }

      // output original wasm file relative to the chunk now that chunking has been achieved

      // SSR will need the .mjs suffix removed from the import before this works in cloudflare, but this is done as a final step
      // so as to support prerendering from nodejs runtime

      const replaced = code.replace(moduleReferenceMatchGlobalRE, (_, moduleReferenceEncoded) => {
        const moduleReferenceData = JSON.parse(decodeURIComponent(moduleReferenceEncoded)) as ModuleReferenceData;
        const { type: moduleType, assetId } = moduleReferenceData;

        const assetFileName = this.getFileName(assetId);
        const chunkFileName = `${assetFileName}.inline.mjs`;

        const assetRelativePath = path.relative(path.dirname(chunk.fileName), assetFileName);
        const chunkRelativePath = path.relative(path.dirname(chunk.fileName), chunkFileName);

        // fix windows paths for import
        const cloudflareImport = assetRelativePath.replaceAll('\\', '/');
        const nodejsImport = chunkRelativePath.replaceAll('\\', '/');

        // record this replacement for later, to adjust it to import the unbundled asset
        replacements.push({
          chunkName: chunk.name,
          chunkFileName: chunk.fileName,
          fileNames: [],
          moduleType,
          cloudflareImport,
          cloudflareFileName: assetFileName,
          nodejsImport,
          nodejsFileName: chunkFileName,
        });

        return `./${nodejsImport}`;
      });

      return { code: replaced };
    },

    generateBundle(_, bundle) {
      // associate the chunk name to the final file name.
      // After the prerendering is done, we can use this to replace the imports after final bundle
      // in a targeted way

      const replacementsByChunkName = new Map<string, Replacement[]>();

      for (const replacement of replacements) {
        const repls = replacementsByChunkName.get(replacement.chunkName) || [];
        if (!repls.length) {
          replacementsByChunkName.set(replacement.chunkName, repls);
        }
        repls.push(replacement);
      }

      for (const chunk of Object.values(bundle)) {
        const repls = (chunk.name && replacementsByChunkName.get(chunk.name)) || [];
        for (const replacement of repls) {
          replacement.fileNames.push(chunk.fileName);
        }
      }
    },

    async closeBundle() {
      if (runtime !== 'workerd') {
        return;
      }

      // Once prerendering is complete, restore the imports to cloudflare compatible ones

      const baseDir = ctx.outDir;

      const replacementsByFileName = new Map<string, Replacement[]>();
      for (const replacement of replacements) {
        for (const fileName of replacement.fileNames) {
          const repls = replacementsByFileName.get(fileName) || [];
          if (!repls.length) {
            replacementsByFileName.set(fileName, repls);
          }
          repls.push(replacement);
        }
      }

      for (const [fileName, repls] of replacementsByFileName.entries()) {
        const filepath = path.join(baseDir, fileName);
        const contents = await fsp.readFile(filepath, 'utf-8');
        let updated = contents;
        for (const replacement of repls) {
          updated = updated.replaceAll(replacement.nodejsImport, replacement.cloudflareImport);
        }
        await fsp.writeFile(filepath, updated, 'utf-8');
      }
    },
  };
}
