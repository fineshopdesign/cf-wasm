import { htmlToReact } from '@cf-wasm/og/html-to-react';
import { CustomFont, GoogleFont, ImageResponse, render } from '@cf-wasm/og/node';
import React from 'react';
import { describe, expect, it } from 'vitest';

describe('CustomFont', () => {
  const customFont = new CustomFont('JetBrains Mono', () =>
    fetch('https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Regular.ttf').then((res) => res.arrayBuffer()),
  );

  it('should load font from ArrayBuffer', async () => {
    expect(customFont).property('name').equals('JetBrains Mono');
    expect(customFont).property('weight').equals(400);
    expect(customFont).property('style').equals('normal');
    expect(customFont).property('data').instanceOf(Promise);

    const buffer = await customFont.data;

    expect(buffer).instanceOf(ArrayBuffer);
    expect(buffer.byteLength).equals(274744);
  });
});

describe('GoogleFont', () => {
  const googleFont = new GoogleFont('Inclusive Sans');

  it('should load font from Google fonts', async () => {
    expect(googleFont).property('family').equals('Inclusive Sans');
    expect(googleFont).property('name').equals('Inclusive Sans');
    expect(googleFont).property('weight').equals(400);
    expect(googleFont).property('style').equals('normal');
    expect(googleFont).property('data').instanceOf(Promise);

    expect(await googleFont.isAvailable()).equals(true);

    const buffer = await googleFont.data;

    expect(buffer).instanceOf(ArrayBuffer);
    expect(buffer.byteLength).equals(36488);
  });
});

describe('htmlToReact', () => {
  it('should parse html to react element', () => {
    // biome-ignore lint/complexity/noUselessFragments: <explanation>
    expect(htmlToReact('Hello World!')).toEqual(<>Hello World!</>);
    expect(htmlToReact('<div>Hello</div>')).toEqual(<div>Hello</div>);
    expect(htmlToReact('<div style="display:flex;">Hello</div>')).toEqual(<div style={{ display: 'flex' }}>Hello</div>);
  });
});

describe('render', () => {
  const renderer = render(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6f90ab',
        fontSize: '2rem',
        color: '#fff',
      }}
    >
      <span>Noto Sans (Default Font)</span>
      <span
        style={{
          fontFamily: 'JetBrains Mono',
        }}
      >
        JetBrains Mono (using GoogleFont class)
      </span>
      <span>These are emojis: 😎🌩️</span>
    </div>,
    {
      fonts: [new GoogleFont('JetBrains Mono')],
      emoji: 'fluent',
    },
  );

  it('can convert to svg', async () => {
    const svg = await renderer.asSvg();

    expect(svg)
      .property('image')
      .match(/<svg\s[^>]*width="1200".*<\/svg>/i)
      .match(/<svg\s[^>]*height="630".*<\/svg>/i);

    expect(svg.image.length).equals(83335);
  });

  it('can convert to png', async () => {
    const png = await renderer.asPng();

    expect(png).property('pixels').instanceOf(Uint8Array);
    expect(png).property('image').instanceOf(Uint8Array);

    expect(png.pixels.byteLength).equals(3024000);
    expect(png.image.byteLength).equals(26428);
  });
});

describe('ImageResponse', () => {
  const response = new ImageResponse(<div>Test</div>, {
    width: 200,
    height: 300,
    format: 'svg',
  });

  it('should have text in svg format', async () => {
    const text = await response.text();

    expect(text)
      .match(/<svg\s[^>]*width="200".*<\/svg>/i)
      .match(/<svg\s[^>]*height="300".*<\/svg>/i);
  });
});
