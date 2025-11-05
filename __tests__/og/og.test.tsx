import { htmlToReact } from '@cf-wasm/og/html-to-react';
import { CustomFont, GoogleFont, ImageResponse, render } from '@cf-wasm/og/node';
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

    const promise1 = customFont.data;
    const promise2 = customFont.data;

    expect(await promise1).instanceOf(ArrayBuffer);
    expect(await promise1).equals(await promise2);
    expect((await promise1).byteLength).equals(273900);
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

    const promise1 = googleFont.data;
    const promise2 = googleFont.data;

    expect(await promise1).instanceOf(ArrayBuffer);
    expect(await promise1).equals(await promise2);
    expect((await promise1).byteLength).equals(59512);
  });
});

describe('htmlToReact', () => {
  it('should parse html to react element', () => {
    expect(htmlToReact('Hello World!')).toEqual(<>Hello World!</>);
    expect(htmlToReact('<div>Hello</div>')).toEqual(<div>Hello</div>);
    expect(htmlToReact('<div style="display:flex;">Hello</div>')).toEqual(<div style={{ display: 'flex' }}>Hello</div>);
    expect(
      htmlToReact(
        '<div style="display:flex;"><div data-attr="dataset-1" style="color:red">Child 1</div><div data-attr="dataset-2" style="color:blue;">Child 2</div></div>',
      ),
    ).toEqual(
      <div style={{ display: 'flex' }}>
        <div data-attr="dataset-1" style={{ color: 'red' }}>
          Child 1
        </div>
        <div data-attr="dataset-2" style={{ color: 'blue' }}>
          Child 2
        </div>
      </div>,
    );
  });
});

describe('render', () => {
  const renderer = render(<div>Hello World!</div>);

  it('can convert to svg', async () => {
    const promise1 = renderer.asSvg();
    const promise2 = renderer.asSvg();

    expect(await promise1).equals(await promise2);
    expect(await promise1)
      .property('image')
      .match(/<svg\s[^>]*width="1200".*<\/svg>/i)
      .match(/<svg\s[^>]*height="630".*<\/svg>/i);
    expect(await promise1)
      .property('width')
      .equals(1200);
    expect(await promise1)
      .property('height')
      .equals(630);
    expect(await promise1)
      .property('type')
      .equals('image/svg+xml');
  });

  it('can convert to png', async () => {
    const promise1 = renderer.asPng();
    const promise2 = renderer.asPng();

    expect(await promise1).equals(await promise2);
    expect(await promise1)
      .property('pixels')
      .instanceOf(Uint8Array);
    expect(await promise1)
      .property('image')
      .instanceOf(Uint8Array);
    expect(await promise1)
      .property('width')
      .equals(1200);
    expect(await promise1)
      .property('height')
      .equals(630);
    expect(await promise1)
      .property('type')
      .equals('image/png');
  });
});

describe('ImageResponse', () => {
  describe('should render ReactElement', () => {
    const response = new ImageResponse(<div>Hello World!</div>, {
      width: 300,
      height: 200,
      format: 'svg',
    });

    it('Response should have text in svg format', async () => {
      const text = await response.text();

      expect(text)
        .match(/<svg\s[^>]*width="300".*<\/svg>/i)
        .match(/<svg\s[^>]*height="200".*<\/svg>/i);
    });
  });

  describe('should render node returned from htmlToReact', () => {
    const response = new ImageResponse(htmlToReact('<div>Hello World!</div>'), {
      width: 300,
      height: 200,
      format: 'svg',
    });

    it('Response should have text in svg format', async () => {
      const text = await response.text();

      expect(text)
        .match(/<svg\s[^>]*width="300".*<\/svg>/i)
        .match(/<svg\s[^>]*height="200".*<\/svg>/i);
    });
  });

  describe('should render node returned from satori-html', () => {
    const response = new ImageResponse(html('<div>Hello World!</div>'), {
      width: 300,
      height: 200,
      format: 'svg',
    });

    it('Response should have text in svg format', async () => {
      const text = await response.text();

      expect(text)
        .match(/<svg\s[^>]*width="300".*<\/svg>/i)
        .match(/<svg\s[^>]*height="200".*<\/svg>/i);
    });
  });
});
