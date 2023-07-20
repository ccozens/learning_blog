function getLuminanceFromRGBString(rgbString: string): number | null {
  const regex = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/;
  const match = rgbString.match(regex);

  if (match) {
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }

  return null;
}

export function getContrastRatio(background: string, text: string): boolean {
  // Function to calculate the contrast ratio
  function calculateContrastRatio(background: string, text: string): number {
    const backgroundLuminance = getLuminanceFromRGBString(background);
    const textLuminance = getLuminanceFromRGBString(text);

    if (backgroundLuminance !== null && textLuminance !== null) {
      const ratio = (Math.max(backgroundLuminance, textLuminance) + 0.05) / (Math.min(backgroundLuminance, textLuminance) + 0.05);
      return ratio;
    }

    // If either luminance value is null, return a negative value to indicate that the contrast cannot be calculated
    return -1;
  }

  const contrastRatio = calculateContrastRatio(background, text);

  // Check against WCAG guidelines for normal and large text
  const isAccessible = contrastRatio >= 4.5 || (contrastRatio >= 3 && background.length < 18);

  return isAccessible;
}
