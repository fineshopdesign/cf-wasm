import { PhotonImage, resize, SamplingFilter } from '$lib/photon';
import type { RequestHandler } from './$types';

const imageUrl = 'https://avatars.githubusercontent.com/u/314135';

export const GET: RequestHandler = async ({ request }) => {
  const url = new URL(request.url);
  const paramScale = Number(url.searchParams.get('scale'));
  const scale = Math.max(1, Math.min(100, Number.isNaN(paramScale) ? 100 : paramScale));

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
};
