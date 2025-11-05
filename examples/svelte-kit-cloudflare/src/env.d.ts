declare module '*.wasm?module' {
  const module: WebAssembly.Module;
  export default module;
}

declare module '*.txt' {
  const module: string;
  export default module;
}

declare module '*.bin' {
  const module: ArrayBuffer;
  export default module;
}
