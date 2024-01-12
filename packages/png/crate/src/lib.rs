use serde::Serialize;

use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;
use serde_wasm_bindgen::to_value;

#[wasm_bindgen]
pub fn encode(
  image: &[u8],
  width: u32,
  height: u32,
  palette: Option<Vec<u8>>,
  trns: Option<Vec<u8>>,
  color: Option<u8>,
  depth: Option<u8>,
  compression: Option<u8>,
  filter: Option<u8>,
) -> Result<Vec<u8>, JsValue> {
  let mut dest = Vec::new();

  {
    let mut encoder = png::Encoder::new(&mut dest, width, height);

    if let Some(palette) = palette {
      encoder.set_palette(palette.to_vec());
    }
    if let Some(trns) = trns {
      encoder.set_trns(trns.to_vec());
    }
    if let Some(color) = color {
      if let Some(color) = png::ColorType::from_u8(color) {
        encoder.set_color(color);
      }
    }
    if let Some(depth) = depth {
      if let Some(depth) = png::BitDepth::from_u8(depth) {
        encoder.set_depth(depth);
      }
    }
    if let Some(compression) = compression {
      match compression {
        0 => encoder.set_compression(png::Compression::Default),
        1 => encoder.set_compression(png::Compression::Fast),
        2 => encoder.set_compression(png::Compression::Best),
        3 => encoder.set_compression(png::Compression::Huffman),
        4 => encoder.set_compression(png::Compression::Rle),
        _ => (),
      }
    }
    if let Some(filter) = filter {
      if let Some(filter) = png::FilterType::from_u8(filter) {
        encoder.set_filter(filter);
      }
    }
    let mut writer = match encoder.write_header() {
      Ok(writer) => writer,
      Err(err) => {
        return Err(JsValue::from_str(&format!("{}", err)));
      }
    };
    if let Err(err) = writer.write_image_data(image) {
      return Err(JsValue::from_str(&format!("{}", err)));
    }
  }

  Ok(dest)
}

#[wasm_bindgen]
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DecodeResult {
  image: Vec<u8>,
  width: u32,
  height: u32,
  color_type: u8,
  bit_depth: u8,
  line_size: usize,
}

#[wasm_bindgen]
pub fn decode(image: &[u8]) -> Result<JsValue, JsValue> {
  let decoder = png::Decoder::new(image);
  let (info, mut reader) = match decoder.read_info() {
    Ok((info, reader)) => (info, reader),
    Err(err) => return Err(JsValue::from_str(&format!("{}", err))),
  };

  let mut image = vec![0; info.buffer_size()];

  if let Err(err) = reader.next_frame(&mut image) {
    return Err(JsValue::from_str(&format!("{}", err)));
  }

  let res = match to_value(&DecodeResult {
    image,
    width: info.width,
    height: info.height,
    color_type: info.color_type as u8,
    bit_depth: info.bit_depth as u8,
    line_size: info.line_size,
  }) {
    Ok(res) => res,
    Err(err) => return Err(JsValue::from_str(&format!("{}", err))),
  };

  Ok(res)
}
