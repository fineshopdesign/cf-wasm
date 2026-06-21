import type { Resvg, ResvgRenderOptions } from '@cf-wasm/resvg/legacy';
import { modules } from './modules';

export function createResvg(
	svg: string | Uint8Array,
	options?: ResvgRenderOptions,
): Promise<Resvg> {
	return modules.resvg.Resvg.async(svg, options);
}

export type {
	BBox,
	RenderedImage,
	Resvg,
	ResvgRenderOptions,
} from '@cf-wasm/resvg/legacy';
