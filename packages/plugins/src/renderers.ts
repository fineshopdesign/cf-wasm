import type { ModuleType } from './shared';

export const inlineModuleRenderers: Record<ModuleType, (contents: Buffer) => string> = {
  CompiledWasm(fileContents) {
    const base64 = fileContents.toString('base64');
    return `export default new WebAssembly.Module(Uint8Array.from(atob("${base64}"), c => c.charCodeAt(0)));\n`;
  },
  Data(fileContents) {
    const base64 = fileContents.toString('base64');
    return `export default Uint8Array.from(atob("${base64}"), c => c.charCodeAt(0)).buffer;\n`;
  },
  Text(fileContents) {
    const escaped = JSON.stringify(fileContents.toString('utf-8'));
    return `export default ${escaped};\n`;
  },
};

export const nodeModuleRenderers: Record<ModuleType, (source: string) => string> = {
  CompiledWasm(source) {
    return `import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const wasmModule = new WebAssembly.Module(fs.readFileSync(path.resolve(dirname, "${source.replaceAll('\\', '/')}")));

export default wasmModule;
`;
  },
  Data(source) {
    return `import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const binModule = fs.readFileSync(path.resolve(dirname, "${source.replaceAll('\\', '/')}")).buffer;

export default binModule;
`;
  },
  Text(source) {
    return `import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const stringModule = fs.readFileSync(path.resolve(dirname, "${source.replaceAll('\\', '/')}"), "utf-8");

export default stringModule;
`;
  },
};
