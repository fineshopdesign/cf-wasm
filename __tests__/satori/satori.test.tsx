import { satori, yogaWasmModule } from '@cf-wasm/satori/node';
import React from 'react';
import { describe, expect, it } from 'vitest';

describe('yogaWasmModule', () => {
  it('should be an instance of WebAssembly.Module', () => {
    expect(yogaWasmModule).instanceOf(WebAssembly.Module);
  });
});

describe('satori', () => {
  it('can convert ReactNode to SVG', async () => {
    const fontBuffer = await (await fetch('https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Regular.ttf')).arrayBuffer();

    const result = await satori(<div style={{ color: 'black' }}>Hello World!</div>, {
      width: 600,
      height: 400,
      fonts: [
        {
          name: 'JetBrains Mono',
          data: fontBuffer,
          weight: 400,
          style: 'normal',
        },
      ],
    });

    expect(result.length).equals(3783);
  });
});
