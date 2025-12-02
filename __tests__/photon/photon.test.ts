import { PhotonImage, photonWasmModule, resize, SamplingFilter } from '@cf-wasm/photon/node';
import { describe, expect, it } from 'vitest';

describe('photonWasmModule', () => {
  it('should be an instance of WebAssembly.Module', () => {
    expect(photonWasmModule).instanceOf(WebAssembly.Module);
  });
});

describe('resize', async () => {
  it('can resize images', async () => {
    const imageUrl = 'https://github.com/fineshopdesign.png';
    const imageBytes = new Uint8Array(await (await fetch(imageUrl)).arrayBuffer());
    const inputImage = PhotonImage.new_from_byteslice(imageBytes);

    const outputImage = resize(inputImage, inputImage.get_width() * 0.5, inputImage.get_height() * 0.5, SamplingFilter.Nearest);

    const outputBytes = outputImage.get_bytes_webp();

    outputImage.free();
    inputImage.free();

    expect(outputBytes.byteLength).equals(11124);
  });
});
