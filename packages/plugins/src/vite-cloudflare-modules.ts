/*!
 * Inspired from: https://github.com/withastro/astro/blob/main/packages/integrations/cloudflare/src/utils/cloudflare-module-loader.ts [MIT]
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { Plugin } from 'vite';

const MODULE_MAGIC_STRING = 'CLOUDFLARE_MODULE';

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

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const MODULE_TYPES = ['CompiledWasm', 'Data', 'Text'] as const;
type ModuleType = (typeof MODULE_TYPES)[number];

const MODULE_PATTERN = `__${MODULE_MAGIC_STRING}__(${MODULE_TYPES.map((x) => escapeRegExp(x)).join('|')})__(.*?)__${MODULE_MAGIC_STRING}__`;
const MODULE_REGEX = new RegExp(MODULE_PATTERN, 'g');

function createModuleReference(type: ModuleType, id: string) {
  return `__${MODULE_MAGIC_STRING}__${type}__${id}__${MODULE_MAGIC_STRING}__`;
}

const renderers: Record<ModuleType, (fileContents: Buffer) => string> = {
  CompiledWasm(fileContents: Buffer) {
    const base64 = fileContents.toString('base64');
    return `const wasmModule = new WebAssembly.Module(Uint8Array.from(atob("${base64}"), c => c.charCodeAt(0))); export default wasmModule;`;
  },
  Data(fileContents: Buffer) {
    const base64 = fileContents.toString('base64');
    return `const binModule = Uint8Array.from(atob("${base64}"), c => c.charCodeAt(0)).buffer; export default binModule;`;
  },
  Text(fileContents: Buffer) {
    const escaped = JSON.stringify(fileContents.toString('utf-8'));
    return `const stringModule = ${escaped}; export default stringModule;`;
  },
};

interface Replacement {
  chunkName: string;
  chunkFileName: string;
  fileNames: string[];
  // desired import for cloudflare
  cloudflareImport: string;
  cloudflareFileName: string;
  // nodejs import that simulates a cloudflare module
  nodejsImport: string;
  nodejsFileName: string;
}

export type Runtime = 'node' | 'workerd';

export interface CloudflareModulesOptions {
  runtime?: Runtime;
}

export default function cloudflareModules({ runtime = 'workerd' }: CloudflareModulesOptions = {}) {
  const ctx = {
    isDev: false,
    outDir: '',
  };

  const adaptersByExtension: Record<string, ModuleType> = {
    '.wasm?module': 'CompiledWasm',
    '.wasm': 'CompiledWasm',
    '.bin': 'Data',
    '.txt': 'Text',
  };
  const extensions = Object.keys(adaptersByExtension);

  const replacements: Replacement[] = [];

  return {
    name: 'vite-plugin-cf-wasm:cloudflare-modules',
    enforce: 'pre',

    configResolved(config) {
      ctx.isDev = config.command === 'serve';
      ctx.outDir = config.build.outDir;
    },

    config() {
      // let vite know that file format and the magic import string is intentional, and will be handled in this plugin
      return {
        assetsInclude: extensions.map((x) => {
          return new RegExp(`${escapeRegExp(x.replace(/\?\w+$/, ''))}$`);
        }),
        build: {
          rollupOptions: {
            // mark the module files as external so that they are not bundled and instead are loaded from the files
            external: Object.entries(adaptersByExtension).map(([extension, type]) => {
              return new RegExp(`^${createModuleReference(type, '.+')}${escapeRegExp(extension.replace(/\?\w+$/, ''))}\\.mjs$`);
            }),
          },
        },
      };
    },

    async load(id) {
      const maybeExtension = extensions.find((x) => id.endsWith(x));
      if (!maybeExtension) {
        return;
      }

      const moduleType = adaptersByExtension[maybeExtension];
      if (!moduleType) {
        return;
      }

      const moduleLoader = renderers[moduleType];

      const filePath = id.replace(/\?\w+$/, '');
      const extension = maybeExtension.replace(/\?\w+$/, '');

      const data = await fs.readFile(filePath);
      const base64 = data.toString('base64');

      const inlineModule = moduleLoader(data);

      if (ctx.isDev) {
        // no need to wire up the assets in dev mode, just rewrite
        return inlineModule;
      }

      // just some shared ID
      const hash = hashString(base64);
      // emit the module binary as an asset file, to be picked up later by the esbuild bundle for the worker.
      // give it a shared deterministic name to make things easy for esbuild to switch on later
      const assetName = `${path.basename(filePath).split('.')[0]}.${hash}${extension}`;

      this.emitFile({
        type: 'asset',
        // emit the data explicitly as an esset with `fileName` rather than `name` so that
        // vite doesn't give it a random hash-id in its name--We need to be able to easily rewrite from
        // the .mjs loader and the actual module asset later in the ESbuild for the worker
        fileName: assetName,
        source: data,
      });

      // however, by default, the SSG generator cannot import the .wasm as a module, so embed as a base64 string
      const chunkId = this.emitFile({
        type: 'prebuilt-chunk',
        fileName: `${assetName}.mjs`,
        code: inlineModule,
      });

      return `import module from "${createModuleReference(moduleType, chunkId)}${extension}.mjs"; export default module;`;
    },

    // output original wasm file relative to the chunk now that chunking has been achieved
    renderChunk(code, chunk) {
      if (ctx.isDev) return;

      if (!MODULE_REGEX.test(code)) {
        return;
      }

      // SSR will need the .mjs suffix removed from the import before this works in cloudflare, but this is done as a final step
      // so as to support prerendering from nodejs runtime
      let replaced = code;
      for (const [ext, type] of Object.entries(adaptersByExtension)) {
        const extension = ext.replace(/\?\w+$/, '');
        // chunk id can be many things, (alpha numeric, dollars, or underscores, maybe more)
        replaced = replaced.replaceAll(
          new RegExp(`${createModuleReference(type, '([^\\s]+?)')}${escapeRegExp(extension)}\\.mjs`, 'g'),
          (_s, assetId) => {
            const fileName = this.getFileName(assetId);
            const relativePath = path.relative(path.dirname(chunk.fileName), fileName).replaceAll('\\', '/'); // fix windows paths for import

            // record this replacement for later, to adjust it to import the unbundled asset
            replacements.push({
              chunkName: chunk.name,
              chunkFileName: chunk.fileName,
              fileNames: [],
              cloudflareImport: relativePath.replace(/\.mjs$/, ''),
              cloudflareFileName: fileName.replace(/\.mjs$/, ''),
              nodejsImport: relativePath,
              nodejsFileName: fileName,
            });

            return `./${relativePath}`;
          },
        );
      }

      return { code: replaced };
    },

    generateBundle(_, bundle) {
      // associate the chunk name to the final file name. After the prerendering is done, we can use this to replace the imports after final bundle
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

      // Once prerendering is complete, restore the imports to cloudflare compatible ones, removing the .mjs suffix.
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
        const contents = await fs.readFile(filepath, 'utf-8');
        let updated = contents;
        for (const replacement of repls) {
          updated = updated.replaceAll(replacement.nodejsImport, replacement.cloudflareImport);
        }
        await fs.writeFile(filepath, updated, 'utf-8');
      }
    },
  } satisfies Plugin;
}
