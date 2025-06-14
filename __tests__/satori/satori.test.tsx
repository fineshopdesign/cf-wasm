import { satori, yogaWasmModule } from '@cf-wasm/satori/node';
import React from 'react';
import { html } from 'satori-html';
import { describe, expect, it } from 'vitest';

describe('yogaWasmModule', () => {
  it('should be an instance of WebAssembly.Module', () => {
    expect(yogaWasmModule).instanceOf(WebAssembly.Module);
  });
});

describe('satori', () => {
  it('can convert ReactNode to SVG', async () => {
    const JetBrainsMonoBuffer = await (
      await fetch('https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Regular.ttf')
    ).arrayBuffer();

    const result = await satori(<div style={{ color: 'black' }}>Hello World!</div>, {
      width: 600,
      height: 400,
      fonts: [
        {
          name: 'JetBrains Mono',
          data: JetBrainsMonoBuffer,
          weight: 400,
          style: 'normal',
        },
      ],
    });

    expect(result.length).equals(3744);
  });

  it('can convert VNode to SVG', async () => {
    const JetBrainsMonoBuffer = await (
      await fetch('https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Regular.ttf')
    ).arrayBuffer();

    const result = await satori(html("<div style='color:black'>Hello World!</div>"), {
      width: 600,
      height: 400,
      fonts: [
        {
          name: 'JetBrains Mono',
          data: JetBrainsMonoBuffer,
          weight: 400,
          style: 'normal',
        },
      ],
    });

    expect(result.length).equals(3833);
  });
});
