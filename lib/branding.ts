export const DEFAULT_PRIMARY_COLOR = '#FF6A00';
export const DEFAULT_PRIMARY_RGB = '255, 106, 0';

const HEX_COLOR_REGEX = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;

export function sanitizePrimaryColor(value?: string | null) {
  if (!value) return DEFAULT_PRIMARY_COLOR;
  return HEX_COLOR_REGEX.test(value) ? value : DEFAULT_PRIMARY_COLOR;
}

export function hexToRgb(hex: string) {
  const sanitizedHex = sanitizePrimaryColor(hex);
  const normalizedHex = sanitizedHex.length === 4
    ? `#${sanitizedHex[1]}${sanitizedHex[1]}${sanitizedHex[2]}${sanitizedHex[2]}${sanitizedHex[3]}${sanitizedHex[3]}`
    : sanitizedHex;

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalizedHex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : DEFAULT_PRIMARY_RGB;
}
