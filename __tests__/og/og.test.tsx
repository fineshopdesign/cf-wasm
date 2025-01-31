import { htmlToReact } from '@cf-wasm/og/html-to-react';
import { CustomFont, GoogleFont, ImageResponse } from '@cf-wasm/og/node';
import React from 'react';
import { html } from 'satori-html';
import { describe, expect, it } from 'vitest';

describe('CustomFont', () => {
  const customFont = new CustomFont('JetBrains Mono', () =>
    fetch('https://github.com/JetBrains/JetBrainsMono/raw/cd5227bd1f61dff3bbd6c814ceaf7ffd95e947d9/fonts/ttf/JetBrainsMono-Regular.ttf').then((res) =>
      res.arrayBuffer(),
    ),
  );

  it('should load font from ArrayBuffer', async () => {
    expect(customFont).property('name').equals('JetBrains Mono');
    expect(customFont).property('weight').equals(400);
    expect(customFont).property('style').equals('normal');
    expect(customFont).property('data').instanceOf(Promise);

    const buffer = await customFont.data;

    expect(buffer).instanceOf(ArrayBuffer);
    expect(buffer.byteLength).equals(273900);
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

    expect(await googleFont.canLoad()).equals(true);

    const buffer = await googleFont.data;

    expect(buffer).instanceOf(ArrayBuffer);
    expect(buffer.byteLength).equals(59512);
  });
});

describe('htmlToReact', () => {
  it('should parse html to react element', () => {
    // biome-ignore lint/complexity/noUselessFragments: we have to check for fragments
    expect(htmlToReact('Hello World!')).toEqual(<>Hello World!</>);
    expect(htmlToReact('<div>Hello</div>')).toEqual(<div>Hello</div>);
    expect(htmlToReact('<div style="display:flex;">Hello</div>')).toEqual(<div style={{ display: 'flex' }}>Hello</div>);
  });
});

/** Following tests were removed, IDK why actions job never finishes when using it, works as expected locally */
// describe('render', () => {
//   const renderer = render(
//     <div
//       style={{
//         display: 'flex',
//         fontSize: 40,
//         color: 'black',
//         background: 'white',
//         width: '100%',
//         height: '100%',
//         padding: '50px 200px',
//         textAlign: 'center',
//         flexDirection: 'column',
//         justifyContent: 'center',
//         alignItems: 'center',
//       }}
//     >
//       <span>👋 | Hello | 你好 | नमस्ते | こんにちは | สวัสดีค่ะ | 안녕 | добрий | день | Hallá</span>
//       <span>Default: Noto Sans</span>
//       <span
//         style={{
//           fontFamily: 'Inclusive Sans',
//         }}
//       >
//         GoogleFont: Inclusive Sans
//       </span>
//       <span>Emojis: ⭐ ✨ 😊 😎 🌩️</span>
//     </div>,
//     {
//       width: 1200,
//       height: 630,
//       fonts: [new GoogleFont('Inclusive Sans')],
//       emoji: 'fluent',
//     },
//   );

//   it('can convert to svg', async () => {
//     const svg = await renderer.asSvg();

//     expect(svg)
//       .property('image')
//       .match(/<svg\s[^>]*width="1200".*<\/svg>/i)
//       .match(/<svg\s[^>]*height="630".*<\/svg>/i);
//   });

//   it('can convert to png', async () => {
//     const png = await renderer.asPng();

//     expect(png).property('pixels').instanceOf(Uint8Array);
//     expect(png).property('image').instanceOf(Uint8Array);
//   });
// });

describe('ImageResponse', () => {
  describe('should render ReactElement', () => {
    const response = new ImageResponse(<div>Hello World!</div>, {
      width: 200,
      height: 300,
      format: 'svg',
    });

    it('Response should have text in svg format', async () => {
      const text = await response.text();

      expect(text)
        .match(/<svg\s[^>]*width="200".*<\/svg>/i)
        .match(/<svg\s[^>]*height="300".*<\/svg>/i);
    });
  });

  describe('should render node returned from htmlToReact', () => {
    const response = new ImageResponse(htmlToReact('<div>Hello World!</div>'), {
      width: 200,
      height: 300,
      format: 'svg',
    });

    it('Response should have text in svg format', async () => {
      const text = await response.text();

      expect(text)
        .match(/<svg\s[^>]*width="200".*<\/svg>/i)
        .match(/<svg\s[^>]*height="300".*<\/svg>/i);
    });
  });

  describe('should render node returned from satori-html', () => {
    const response = new ImageResponse(html('<div>Hello World!</div>'), {
      width: 200,
      height: 300,
      format: 'svg',
    });

    it('Response should have text in svg format', async () => {
      const text = await response.text();

      expect(text)
        .match(/<svg\s[^>]*width="200".*<\/svg>/i)
        .match(/<svg\s[^>]*height="300".*<\/svg>/i);
    });
  });
});
