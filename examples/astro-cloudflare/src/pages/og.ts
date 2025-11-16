import type { APIRoute } from 'astro';
import { ImageResponse } from '@/lib/og';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const paramName = url.searchParams.get('name');

  // satori can only render react node out-of-the-box
  return await ImageResponse.async({
    key: '0',
    type: 'div',
    props: {
      style: {
        display: 'flex',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(253, 243, 255, 1)',
        color: 'rgba(10, 10, 12, 1)',
        fontSize: '40px',
      },
      children: [`Hello ${paramName || 'World'}!`],
    },
  });
};
