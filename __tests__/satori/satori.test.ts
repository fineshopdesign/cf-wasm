import { YOGA_MODULE } from '@cf-wasm/satori/node';
import { describe, expect, it } from 'vitest';

describe('YOGA_MODULE', () => {
  it('should be an instance of WebAssembly.Module', () => {
    expect(YOGA_MODULE).instanceOf(WebAssembly.Module);
  });
});
