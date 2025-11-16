import { type MinifyOptions, minify } from '@cf-wasm/minify-html/node';
import { describe, expect, it } from 'vitest';

describe('minify', () => {
  it('should minify html', async () => {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const code = encoder.encode('<p>  Hello, world!  </p>');
    const options: MinifyOptions = {
      keep_comments: true,
    };

    const minified = decoder.decode(minify(code, options));

    expect(minified).equals('<p>Hello, world!');
  });
});
