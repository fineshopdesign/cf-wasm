export const CONTAINER = {
  _enc: undefined as TextEncoder | undefined,
  get enc() {
    return new TextEncoder();
  },
};
