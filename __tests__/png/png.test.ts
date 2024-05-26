import { MODULE } from '@cf-wasm/png/node';
import { describe, expect, it } from 'vitest';

describe('MODULE', () => {
  it('should be an instance of WebAssembly.Module', () => {
    expect(MODULE).instanceOf(WebAssembly.Module);
  });
});
