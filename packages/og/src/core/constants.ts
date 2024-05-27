/** On demand value */
class Container {
  private _encoder?: TextEncoder;

  get encoder() {
    this._encoder ??= new TextEncoder();
    return this._encoder;
  }
}

export const CONTAINER = new Container();
