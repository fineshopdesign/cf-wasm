declare module '*.wasm' {
  const content: WebAssembly.Module;
  export default content;
}

declare module '*.wasm?module' {
  const content: WebAssembly.Module;
  export default content;
}
