export default function getContrastingTextColor(hexColor: string) {
  const normalizedHex = hexColor.replace('#', '');
  if (normalizedHex.length !== 6) return '#FFFFFF';
  const red = Number.parseInt(normalizedHex.slice(0, 2), 16);
  const green = Number.parseInt(normalizedHex.slice(2, 4), 16);
  const blue = Number.parseInt(normalizedHex.slice(4, 6), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;
  return luminance >= 160 ? '#111827' : '#FFFFFF';
}
