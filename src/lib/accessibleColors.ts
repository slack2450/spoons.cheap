export const accessibleText = {
  paperMuted: {
    foreground: '#626d67',
    background: '#fffdf8',
    className: 'text-[#626d67]',
  },
  creamMuted: {
    foreground: '#626d67',
    background: '#f7f2e8',
    className: 'text-[#626d67]',
  },
  creamAccent: {
    foreground: '#5a7011',
    background: '#f7f2e8',
    className: 'text-[#5a7011]',
  },
  inkMuted: {
    foreground: '#91a198',
    background: '#17231d',
    className: 'text-[#91a198]',
  },
  searchMuted: {
    foreground: '#5d645f',
    background: '#fffdf8',
    className: 'text-ink/70',
  },
  landingText: {
    foreground: '#eef1ea',
    background: '#58742b',
    className: 'text-white/90',
  },
} as const;

function channelToLinear(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!match) throw new TypeError(`Expected a six-digit hex color, received ${hex}`);
  const [, red, green, blue] = match;
  return 0.2126 * channelToLinear(Number.parseInt(red, 16))
    + 0.7152 * channelToLinear(Number.parseInt(green, 16))
    + 0.0722 * channelToLinear(Number.parseInt(blue, 16));
}

export function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}
