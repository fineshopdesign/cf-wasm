import { MODULE as MODULELegacy } from '@cf-wasm/resvg/2.4.1/node';
import { MODULE } from '@cf-wasm/resvg/node';
import { describe, expect, it } from 'vitest';

describe('MODULE', () => {
  it('should be an instance of WebAssembly.Module', () => {
    expect(MODULELegacy).instanceOf(WebAssembly.Module);
    expect(MODULE).instanceOf(WebAssembly.Module);
  });
});
