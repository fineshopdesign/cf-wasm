import { MODULE as MODULELegacy } from '@cf-wasm/resvg/2.4.1/node';
import { MODULE } from '@cf-wasm/resvg/node';
import { expect, test } from 'vitest';

test('resvg.MODULE should be an instance of WebAssembly.Module', () => {
  expect(MODULELegacy).instanceOf(WebAssembly.Module);
  expect(MODULE).instanceOf(WebAssembly.Module);
});
