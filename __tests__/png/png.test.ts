import { pngWasmModule } from '@cf-wasm/png/node';
import { describe, expect, it } from 'vitest';

describe('pngWasmModule', () => {
  it('should be an instance of WebAssembly.Module', () => {
    expect(pngWasmModule).instanceOf(WebAssembly.Module);
  });
});
