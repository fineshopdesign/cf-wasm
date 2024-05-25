import { MODULE } from '@cf-wasm/photon/node';
import { expect, test } from 'vitest';

test('MODULE should be an instance of WebAssembly.Module', () => {
  expect(MODULE).instanceOf(WebAssembly.Module);
});
