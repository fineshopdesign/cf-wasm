import { getQuickJSWASMModule } from '@cf-wasm/quickjs/node';
import { assert, describe, it } from 'vitest';

describe('evalCode', async () => {
  const QuickJS = await getQuickJSWASMModule();

  it('should evaluate javascript', () => {
    const result = QuickJS.evalCode("({ prop1: 3 * 4, prop2: 'Hello World!' })");
    assert.deepEqual(result, { prop1: 3 * 4, prop2: 'Hello World!' });
  });
});
