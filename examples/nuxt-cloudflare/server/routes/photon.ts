import { PhotonImage, resize, SamplingFilter } from '@cf-wasm/photon';

export default defineEventHandler(async (event) => {
  const url = new URL(event.url, 'http://localhost');
  const paramScale = Number(url.searchParams.get('scale') || '100');
  const scale = Math.max(1, Math.min(100, Number.isNaN(paramScale) ? 100 : paramScale));

  const imageUrl = 'https://avatars.githubusercontent.com/u/314135';

  const inputBytes = await fetch(imageUrl)
    .then((res) => res.arrayBuffer())
    .then((buffer) => new Uint8Array(buffer));

  const inputImage = PhotonImage.new_from_byteslice(inputBytes);

  const outputImage = resize(inputImage, inputImage.get_width() * (scale / 100), inputImage.get_height() * (scale / 100), SamplingFilter.Nearest);

  const outputBytes = outputImage.get_bytes_webp();

  inputImage.free();
  outputImage.free();

  return new Response(outputBytes as Uint8Array<ArrayBuffer>, {
    headers: {
      'Content-Type': 'image/webp',
    },
  });
});
