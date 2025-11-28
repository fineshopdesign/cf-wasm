export function cleanUrl(url: string) {
  return url.replace(/[?#].*$/, '');
}

/**
 * Returns a deterministic 32 bit hash code from a string
 */
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32bit integer
  }
  return new Uint32Array([hash])[0].toString(36);
}
