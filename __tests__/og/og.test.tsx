import { ImageResponse, render } from '@cf-wasm/og/node';
import { stringToNode } from '@cf-wasm/og/string-to-node';
import React from 'react';
import { describe, expect, it } from 'vitest';

describe('render', () => {
  const renderer = render(<div style={{ display: 'flex' }}>Test</div>);

  it('can convert to svg', async () => {
    const svg = await renderer.asSvg();

    expect(svg)
      .property('image')
      .match(/<svg\s[^>]*width="1200".*<\/svg>/i)
      .match(/<svg\s[^>]*height="630".*<\/svg>/i);
  });

  it('can convert to png', async () => {
    const png = await renderer.asPng();

    expect(png).property('pixels').instanceOf(Uint8Array);
    expect(png).property('image').instanceOf(Uint8Array);
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

describe('stringToNode', () => {
  it('should return a ReactElement', () => {
    expect(stringToNode('<div>Hello</div>')).toEqual(<div>Hello</div>);
    expect(stringToNode('<div style="display:flex;">Hello</div>')).toEqual(<div style={{ display: 'flex' }}>Hello</div>);
  });
});
