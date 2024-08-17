/* Polyfills ImageData constructor if it is not defined in globalThis object */

interface Settings {
  colorSpace?: 'display-p3' | 'srgb';
}

const globalObject = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : self;

if (!('ImageData' in globalObject)) {
  const widthMap = new WeakMap();
  const heightMap = new WeakMap();
  const colorSpaceMap = new WeakMap();
  const colorSpaceEnum = ['display-p3', 'srgb'];

  function getColorSpaceFromImageSettings(imageSettings?: unknown) {
    if (typeof imageSettings !== 'undefined') {
      if (typeof imageSettings !== 'object') {
        throw new TypeError("Failed to construct 'ImageData': The provided value is not of type 'ImageDataSettings'.");
      }
      if (imageSettings && 'colorSpace' in imageSettings && typeof imageSettings.colorSpace !== 'undefined') {
        if (typeof imageSettings.colorSpace !== 'string' || !colorSpaceEnum.includes(imageSettings.colorSpace)) {
          throw new TypeError(
            `Failed to construct 'ImageData': Failed to read the 'colorSpace' property from 'ImageDataSettings': The provided value '${imageSettings.colorSpace}' is not a valid enum value of type PredefinedColorSpace.`,
          );
        }
        return imageSettings.colorSpace;
      }
    }
    // defaults to srgb
    return 'srgb';
  }

  class ImageData {
    constructor(...args: [Uint8ClampedArray | number, number, number | Settings | undefined, Settings | undefined]) {
      let imageWidth: number;
      let imageHeight: number;
      let imageData: Uint8ClampedArray;
      let imageColorSpace: string;

      const [arg1, arg2, arg3, arg4] = args;

      // At least 2 arguments are required
      if (args.length < 2) {
        throw new TypeError(`Failed to construct 'ImageData': 2 arguments required, but only ${args.length} present.`);
      }

      /**
       * Case 1:
       * Argument 1: (data) Uint8ClampedArray
       * Argument 2: (width) number
       * Argument 3: (height) number - Optional
       * Argument 4: (settings) object - Optional
       */
      if (typeof arg1 === 'object') {
        if (!(arg1 instanceof Uint8ClampedArray)) {
          throw new TypeError("Failed to construct 'ImageData': parameter 1 is not of type 'Uint8ClampedArray'.");
        }

        if (typeof arg2 !== 'number' || arg2 === 0) {
          throw new Error("Failed to construct 'ImageData': The source width is zero or not a number.");
        }

        imageData = arg1;
        imageWidth = arg2 >>> 0;

        if (imageWidth * 4 > imageData.length) {
          throw new Error("Failed to construct 'ImageData': The requested image size exceeds the supported range.");
        }

        if (imageData.length % 4 !== 0) {
          throw new Error("Failed to construct 'ImageData': The input data length is not a multiple of 4.");
        }

        if (imageData.length % (4 * imageWidth) !== 0) {
          throw new Error("Failed to construct 'ImageData': The input data length is not a multiple of (4 * width).");
        }

        if (typeof arg3 !== 'undefined') {
          if (typeof arg3 !== 'number' || arg3 === 0) {
            throw new Error("Failed to construct 'ImageData': The source height is zero or not a number.");
          }

          imageHeight = arg3 >>> 0;

          if (imageData.length % (4 * imageWidth * imageHeight) !== 0) {
            throw new Error("Failed to construct 'ImageData': The input data length is not equal to (4 * width * height).");
          }
        } else {
          imageHeight = imageData.byteLength / imageWidth / 4;
        }

        imageColorSpace = getColorSpaceFromImageSettings(arg4);
      } else {
        /**
         * Case 2:
         * Argument 1: (width) number
         * Argument 2: (height) number
         * Argument 3: (settings) object - Optional
         */
        if (typeof arg1 !== 'number' || arg1 === 0) {
          throw new Error("Failed to construct 'ImageData': The source width is zero or not a number.");
        }

        imageWidth = arg1 >>> 0;

        if (typeof arg2 !== 'number' || arg2 === 0) {
          throw new Error("Failed to construct 'ImageData': The source height is zero or not a number.");
        }

        imageHeight = arg2 >>> 0;

        if (imageWidth * imageHeight >= 1 << 30) {
          throw new Error("Failed to construct 'ImageData': The requested image size exceeds the supported range.");
        }

        imageData = new Uint8ClampedArray(imageWidth * imageHeight * 4);
        imageColorSpace = getColorSpaceFromImageSettings(arg3);
      }

      widthMap.set(this, imageWidth);
      heightMap.set(this, imageHeight);
      colorSpaceMap.set(this, imageColorSpace);
      Object.defineProperty(this, 'data', {
        configurable: true,
        enumerable: true,
        value: imageData,
        writable: false,
      });
    }
  }

  Object.defineProperty(ImageData.prototype, 'width', {
    enumerable: true,
    configurable: true,
    get() {
      return widthMap.get(this);
    },
  });

  Object.defineProperty(ImageData.prototype, 'height', {
    enumerable: true,
    configurable: true,
    get() {
      return heightMap.get(this);
    },
  });

  Object.defineProperty(ImageData.prototype, 'colorSpace', {
    enumerable: true,
    configurable: true,
    get() {
      return colorSpaceMap.get(this);
    },
  });

  (globalObject as { ImageData: typeof ImageData }).ImageData = ImageData;
}

export const ImageData = globalObject.ImageData;
