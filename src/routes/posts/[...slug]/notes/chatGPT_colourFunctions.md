---
title: ''
date: '2023-07-31'
description: description
tags:
  - AI
---

Person:
- in javascript, how do I calculate whether background colour and text colour have good a11y contrast?

ChatGPT:
- To calculate whether the background color and text color have good accessibility (a11y) contrast in JavaScript, you can use the WCAG (Web Content Accessibility Guidelines) formula to check the contrast ratio between the two colors. The contrast ratio should be at least 4.5:1 for normal text and 3:1 for large text (18pt or 14pt bold).

Here's a function that takes the background color and text color as input and returns `true` if the contrast ratio is sufficient for accessibility or `false` otherwise:

```javascript

function getContrastRatio(background, text) {
  // Helper function to convert a hex color to its RGB components
  function hexToRGB(hex) {
    const hexValue = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexValue);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Function to calculate the luminance of a color
  function getLuminance(color) {
    const rgb = hexToRGB(color);
    return (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  }

  // Function to calculate the contrast ratio
  function calculateContrastRatio(background, text) {
    const backgroundLuminance = getLuminance(background);
    const textLuminance = getLuminance(text);
    const ratio = (Math.max(backgroundLuminance, textLuminance) + 0.05) / (Math.min(backgroundLuminance, textLuminance) + 0.05);
    return ratio;
  }

  const contrastRatio = calculateContrastRatio(background, text);

  // Check against WCAG guidelines for normal and large text
  const isAccessible = contrastRatio >= 4.5 || (contrastRatio >= 3 && background.length < 18);

  return isAccessible;
}

// Example usage:
const background = "#FFFFFF"; // White background
const text = "#000000"; // Black text
const isAccessible = getContrastRatio(background, text);
console.log("Is the contrast accessible?", isAccessible);
```



In this example, the function `getContrastRatio` takes two hex color values for background and text. The function calculates the contrast ratio and then compares it with the WCAG guidelines to determine whether the contrast is accessible.

Keep in mind that this function assumes that the input colors are in the hexadecimal format (e.g., "#FFFFFF" for white and "#000000" for black). If you're working with other color formats, you may need to adjust the code accordingly.

Person:
- Please amend to typescript

ChatGPT:
- Sure! Here's the TypeScript version of the function:

```typescript

function getContrastRatio(background: string, text: string): boolean {
  // Helper function to convert a hex color to its RGB components
  function hexToRGB(hex: string): { r: number; g: number; b: number } | null {
    const hexValue = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexValue);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Function to calculate the luminance of a color
  function getLuminance(color: string): number {
    const rgb = hexToRGB(color);
    if (!rgb) return 0;

    return (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  }

  // Function to calculate the contrast ratio
  function calculateContrastRatio(background: string, text: string): number {
    const backgroundLuminance = getLuminance(background);
    const textLuminance = getLuminance(text);
    const ratio = (Math.max(backgroundLuminance, textLuminance) + 0.05) / (Math.min(backgroundLuminance, textLuminance) + 0.05);
    return ratio;
  }

  const contrastRatio = calculateContrastRatio(background, text);

  // Check against WCAG guidelines for normal and large text
  const isAccessible = contrastRatio >= 4.5 || (contrastRatio >= 3 && background.length < 18);

  return isAccessible;
}

// Example usage:
const background = "#FFFFFF"; // White background
const text = "#000000"; // Black text
const isAccessible: boolean = getContrastRatio(background, text);
console.log("Is the contrast accessible?", isAccessible);
```



The main difference in the TypeScript version is the addition of type annotations for function parameters and return types. We also specify the type for the `isAccessible` variable. Other than that, the functionality remains the same as the JavaScript version.

Person:
- how do I parse this string: const rgb = `rgb(${r}, ${g}, ${b})`; into a format accessable by this function (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;

ChatGPT:
- To parse the RGB string format (`rgb(r, g, b)`) into individual color components (r, g, and b) that can be used in your luminance calculation function, you'll need to extract the numeric values from the string and then convert them to numbers. You can achieve this using regular expressions in JavaScript/TypeScript. Here's how you can do it:

```typescript

function getLuminanceFromRGBString(rgbString: string): number | null {
  // Regular expression to match the numbers in the RGB string
  const regex = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/;
  const match = rgbString.match(regex);

  if (match) {
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);

    // Calculate the luminance using the formula
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }

  return null; // Return null if the RGB string is invalid or doesn't match the regex
}

// Example usage:
const rgb = "rgb(255, 255, 255)"; // White color in RGB format
const luminance = getLuminanceFromRGBString(rgb);
console.log("Luminance:", luminance); // Output: Luminance: 1 (for white color)
```



In this example, the function `getLuminanceFromRGBString` takes an RGB string as input and uses a regular expression to extract the numeric values for the red (r), green (g), and blue (b) components. It then calculates the luminance using the formula you provided and returns the result. If the RGB string is not in the correct format or does not match the regex, the function returns `null`.

Note that this function assumes the RGB string is correctly formatted as `"rgb(r, g, b)"`, where `r`, `g`, and `b` are integers representing the color components between 0 and 255. If you need to handle other formats or color representations, you may need to adjust the regular expression or parsing logic accordingly.

Person:
- please update getContrastRatio to use getLuminanceFromRGBString instead of getLuminance, and drop the first helper hexToRGB

ChatGPT:
- Sure! We can update the `getContrastRatio` function to use `getLuminanceFromRGBString` instead of `getLuminance` and drop the `hexToRGB` helper function since we will no longer need it. Here's the updated TypeScript function:

```typescript

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

function getContrastRatio(background: string, text: string): boolean {
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

// Example usage:
const background = "rgb(255, 255, 255)"; // White background
const text = "rgb(0, 0, 0)"; // Black text
const isAccessible: boolean = getContrastRatio(background, text);
console.log("Is the contrast accessible?", isAccessible);
```



In this updated version, we've removed the `hexToRGB` helper function and replaced the luminance calculation with `getLuminanceFromRGBString`. The `getLuminanceFromRGBString` function parses the RGB string and calculates the luminance accordingly. If the luminance calculation fails due to an invalid RGB string, the function will return `null`.

The `getContrastRatio` function now checks if both background and text luminance values are not `null` before calculating the contrast ratio. If either value is `null`, it returns a negative value (`-1`) to indicate that the contrast cannot be calculated. Otherwise, it proceeds with calculating the contrast ratio and determines accessibility based on the WCAG guidelines.
