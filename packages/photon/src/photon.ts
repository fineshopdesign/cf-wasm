import '@cf-wasm/internals/polyfills/image-data';
import initAsync, { type InitInput, type InitOutput, initSync, type SyncInitInput } from './lib/photon_rs';

/** Initializes photon asynchronously */
export async function initPhoton(
  input:
    | {
        module_or_path: InitInput | Promise<InitInput>;
      }
    | InitInput
    | Promise<InitInput>,
): Promise<InitOutput> {
  if (initPhoton.initialized) {
    throw new Error('(@cf-wasm/photon): Function already called. The `initPhoton()` function can be used only once.');
  }
  if (!input) {
    throw new Error('(@cf-wasm/photon): Argument `input` is not valid.');
  }
  initPhoton.initialized = true;
  initPhoton.promise = (async () => {
    const output = await initAsync(await input);
    initPhoton.ready = true;
    return output;
  })();
  return initPhoton.promise;
}

/** Initializes photon synchronously */
initPhoton.sync = (input: { module: SyncInitInput } | SyncInitInput): InitOutput => {
  if (initPhoton.initialized) {
    throw new Error('(@cf-wasm/photon): Function already called. The `initPhoton()` function can be used only once.');
  }
  if (!input) {
    throw new Error('(@cf-wasm/photon): Argument `input` is not valid.');
  }
  initPhoton.initialized = true;
  const output = initSync(input);
  initPhoton.promise = Promise.resolve(output);
  initPhoton.ready = true;
  return output;
};

initPhoton.promise = null as Promise<InitOutput> | null;
/** Indicates whether photon is initialized */
initPhoton.initialized = false;
/** Indicates whether photon is ready */
initPhoton.ready = false;

/** Ensures photon is ready */
initPhoton.ensure = async () => {
  if (!initPhoton.promise) {
    throw new Error('(@cf-wasm/photon): Function not called. Call `initPhoton()` function first.');
  }
  return initPhoton.promise;
};

export {
  add_noise_rand,
  adjust_brightness,
  adjust_contrast,
  alter_blue_channel,
  alter_channel,
  alter_channels,
  alter_green_channel,
  alter_red_channel,
  alter_two_channels,
  apply_gradient,
  b_grayscale,
  base64_to_image,
  base64_to_vec,
  blend,
  box_blur,
  cali,
  color_horizontal_strips,
  color_vertical_strips,
  colorize,
  create_gradient,
  crop,
  crop_img_browser,
  darken_hsl,
  darken_hsluv,
  darken_hsv,
  darken_lch,
  dec_brightness,
  decompose_max,
  decompose_min,
  desaturate,
  desaturate_hsl,
  desaturate_hsluv,
  desaturate_hsv,
  desaturate_lch,
  detect_45_deg_lines,
  detect_135_deg_lines,
  detect_horizontal_lines,
  detect_vertical_lines,
  dither,
  dramatic,
  draw_text,
  draw_text_with_border,
  duotone,
  duotone_horizon,
  duotone_lilac,
  duotone_ochre,
  duotone_tint,
  duotone_violette,
  edge_detection,
  edge_one,
  emboss,
  filter,
  firenze,
  fliph,
  flipv,
  frosted_glass,
  g_grayscale,
  gamma_correction,
  gaussian_blur,
  get_image_data,
  golden,
  grayscale,
  grayscale_human_corrected,
  grayscale_shades,
  halftone,
  horizontal_strips,
  hsl,
  hsluv,
  hsv,
  hue_rotate_hsl,
  hue_rotate_hsluv,
  hue_rotate_hsv,
  hue_rotate_lch,
  type InitInput,
  type InitOutput,
  identity,
  inc_brightness,
  invert,
  laplace,
  lch,
  lighten_hsl,
  lighten_hsluv,
  lighten_hsv,
  lighten_lch,
  lix,
  lofi,
  mix_with_colour,
  monochrome,
  monochrome_tint,
  multiple_offsets,
  neue,
  noise_reduction,
  normalize,
  obsidian,
  offset,
  offset_blue,
  offset_green,
  offset_red,
  oil,
  open_image,
  PhotonImage,
  padding_bottom,
  padding_left,
  padding_right,
  padding_top,
  padding_uniform,
  pastel_pink,
  pink_noise,
  pixelize,
  prewitt_horizontal,
  primary,
  putImageData,
  Rgb,
  Rgba,
  r_grayscale,
  remove_blue_channel,
  remove_channel,
  remove_green_channel,
  remove_red_channel,
  resample,
  resize,
  resize_img_browser,
  rotate,
  run,
  ryo,
  SamplingFilter,
  type SyncInitInput,
  saturate_hsl,
  saturate_hsluv,
  saturate_hsv,
  saturate_lch,
  seam_carve,
  selective_color_convert,
  selective_desaturate,
  selective_greyscale,
  selective_hue_rotate,
  selective_lighten,
  selective_saturate,
  sepia,
  sharpen,
  shearx,
  sheary,
  single_channel_grayscale,
  sobel_global,
  sobel_horizontal,
  sobel_vertical,
  solarize,
  solarize_retimg,
  swap_channels,
  threshold,
  tint,
  to_image_data,
  to_raw_pixels,
  vertical_strips,
  watermark,
} from './lib/photon_rs';
