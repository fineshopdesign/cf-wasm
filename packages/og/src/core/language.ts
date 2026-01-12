import { googleFonts } from './font';

/** Language font map */
export const LANGUAGE_FONT_MAP = {
  'ja-JP': 'Noto+Sans+JP',
  'ko-KR': 'Noto+Sans+KR',
  'zh-CN': 'Noto+Sans+SC',
  'zh-TW': 'Noto+Sans+TC',
  'zh-HK': 'Noto+Sans+HK',
  'th-TH': 'Noto+Sans+Thai',
  'bn-IN': 'Noto+Sans+Bengali',
  'ar-AR': 'Noto+Sans+Arabic',
  'ta-IN': 'Noto+Sans+Tamil',
  'ml-IN': 'Noto+Sans+Malayalam',
  'he-IL': 'Noto+Sans+Hebrew',
  'te-IN': 'Noto+Sans+Telugu',
  devanagari: 'Noto+Sans+Devanagari',
  kannada: 'Noto+Sans+Kannada',
  symbol: ['Noto+Sans+Symbols', 'Noto+Sans+Symbols+2'],
  math: 'Noto+Sans+Math',
  unknown: 'Noto+Sans',
};

export function convert(input: string): (number | [number, number])[] {
  return input.split(', ').map((r) => {
    const range = r.replaceAll('U+', '');
    const [start, end] = range.split('-').map((hex) => Number.parseInt(hex, 16));

    if (typeof end !== 'number' || Number.isNaN(end)) {
      return start;
    }
    return [start, end];
  });
}

export function checkSegmentInRange(segment: string, range: (number | number[])[]): boolean {
  const codePoint = segment.codePointAt(0);
  if (!codePoint) {
    return false;
  }
  return range.some((value) => {
    if (typeof value === 'number') {
      return codePoint === value;
    }
    const [start, end] = value;
    return start <= codePoint && codePoint <= end;
  });
}

export class FontDetector {
  private rangesByLang: Record<string, (number | number[])[]>;

  constructor() {
    this.rangesByLang = {};
  }

  private addDetectors(input: string) {
    const regex = /font-family:\s*'(.+?)';.+?unicode-range:\s*(.+?);/gms;
    const matches = input.matchAll(regex);
    for (const [, _lang, range] of matches) {
      const lang = _lang.replaceAll(' ', '+');
      this.rangesByLang[lang] ??= [];
      this.rangesByLang[lang].push(...convert(range));
    }
  }

  private detectSegment(segment: string, fonts: string[]): string | null {
    for (const font of fonts) {
      const range = this.rangesByLang[font];
      if (range && checkSegmentInRange(segment, range)) {
        return font;
      }
    }
    return null;
  }

  private async load(fonts: string[]) {
    let params = '';

    const existingLang = Object.keys(this.rangesByLang);
    const langNeedsToLoad = fonts.filter((font) => !existingLang.includes(font));

    if (langNeedsToLoad.length === 0) {
      return;
    }

    for (const font of langNeedsToLoad) {
      params += `family=${font}&`;
    }
    params += 'display=swap';

    const cssUrl = `https://fonts.googleapis.com/css2?${params}`;

    const fontFace = await googleFonts.loadCss(
      cssUrl,
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    );

    this.addDetectors(fontFace);
  }

  public async detect(text: string, fonts: string[]): Promise<Record<string, string>> {
    await this.load(fonts);
    const result: Record<string, string> = {};
    for (const segment of text) {
      const lang = this.detectSegment(segment, fonts);
      if (lang) {
        result[lang] = result[lang] || '';
        result[lang] += segment;
      }
    }
    return result;
  }
}
