import { HslValues } from '../textures/HslValues';

/**
 * converts RGB255 to HSL,
 * where H is -360 to 360, S & L are -100 to 100
 */
export default function rgbToHsl(r: number, g: number, b: number): HslValues {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l;

  // Calculate the hue
  if (max === min) {
    h = 0; // Achromatic
  } else if (max === r) {
    h = ((g - b) / (max - min)) % 6;
  } else if (max === g) {
    h = (b - r) / (max - min) + 2;
  } else {
    h = (r - g) / (max - min) + 4;
  }

  h = Math.round(h * 60); // Convert hue to degrees
  if (h < 0) {
    h += 360; // Make sure hue is within 0-359
  }

  // Calculate the lightness
  l = (max + min) / 2;

  // Calculate the saturation
  if (max === min) {
    s = 0; // Achromatic
  } else if (l <= 0.5) {
    s = (max - min) / (max + min);
  } else {
    s = (max - min) / (2 - max - min);
  }

  s = s * 100; // Convert saturation to percentage
  l = l * 100; // Convert lightness to percentage

  return { h, s, l };
}
