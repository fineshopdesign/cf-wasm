declare module '*.wasm' {
  const module: WebAssembly.Module;
  export default module;
}

declare module '*.wasm?module' {
  const module: WebAssembly.Module;
  export default module;
}

declare module '*.txt' {
  const text: string;
  export default text;
}
