import { YOGA_MODULE } from '@cf-wasm/satori/node';
import { expect, test } from 'vitest';

test('YOGA_MODULE should be an instance of WebAssembly.Module', () => {
  expect(YOGA_MODULE).instanceOf(WebAssembly.Module);
});
