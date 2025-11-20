import { Resvg as ResvgLegacy, resvgWasmModule as resvgWasmModuleLegacy } from '@cf-wasm/resvg/legacy/node';
import { Resvg, resvgWasmModule } from '@cf-wasm/resvg/node';
import { describe, expect, it } from 'vitest';

const svgString = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve">
  <g>
    <circle fill="#F7F4FD" cx="256" cy="256" r="256"/>
    <path fill="#9457F6" d="M145.4,389V264.8c0-19.2,5.7-30.3,14.1-40.2c8.3-9.8,22.7-15.8,38-15.8l3.7-0.1h123.6c23.1,0,41.8,18.8,41.8,42.1c0,11.2-4.4,21.8-12.3,29.8L216.9,418.8c-16.3,16.4-42.9,16.4-59.2,0C149.8,410.9,145.4,400.2,145.4,389z"/>
    <path fill="#52F3E4" d="M145.4,261.2V137c0-31,25-56.1,55.8-56.1l0,0h123.6c23.1,0,41.8,18.8,41.8,42.1c0,11.2-4.4,21.8-12.3,29.8L216.9,291c-16.3,16.4-42.9,16.4-59.2,0C149.8,283.1,145.4,272.4,145.4,261.2z"/>
    <path fill="#0FBFF2" d="M216.9,291l81.9-82.3H196c-27.9,0-50.6,22.8-50.6,50.9v1.6c0,23.2,18.7,42.1,41.8,42.1C198.3,303.3,209,298.9,216.9,291z"/>
  </g>
</svg>`;

describe('resvgWasmModule', () => {
  it('should be an instance of WebAssembly.Module', () => {
    expect(resvgWasmModuleLegacy).instanceOf(WebAssembly.Module);
    expect(resvgWasmModule).instanceOf(WebAssembly.Module);
  });
});

describe('Resvg legacy', () => {
  it('should convert svg to png', async () => {
    const resvg = await ResvgLegacy.async(svgString);
    const rendered = resvg.render();
    const pixels = rendered.pixels;
    const bytes = rendered.asPng();

    expect(pixels.byteLength).equals(1048576);
    expect(bytes.byteLength).equals(13636);

    rendered.free();
    resvg.free();
  });
});

describe('Resvg', () => {
  it('should convert svg to png', async () => {
    const resvg = await Resvg.async(svgString);
    const rendered = resvg.render();
    const pixels = rendered.pixels;
    const bytes = rendered.asPng();

    expect(pixels.byteLength).equals(1048576);
    expect(bytes.byteLength).equals(13657);

    rendered.free();
    resvg.free();
  });
});
