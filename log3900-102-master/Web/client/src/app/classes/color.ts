// tslint:disable: no-magic-numbers | Reason : Hex string manipulation requires indices
import * as CONSTANT from 'src/app/classes/constants';
import {
  COLOR_REGEX_RGB_VALUE_IN_HEX,
  COLOR_REGEX_WITH_HASHTAG,
  COLOR_REGEX_WITHOUT_HASHTAG
} from 'src/app/classes/regular-expressions';

export class Color {

  private hex: string;

  constructor(color?: string | number[]) {
    if (typeof color === 'string') {
        this.setHex(color);
    } else if (color instanceof Array) {
        this.setRGB(color);
    } else {
        this.hex = CONSTANT.DEFAULT_PRIMARY_COLOR;
    }
  }

  private static rgbToHex(value: number): string {
    let hex = Number(value).toString(CONSTANT.HEX_BASE);
    if (hex.length < 2) {
        hex = '0' + hex;
    }
    hex = hex.toUpperCase();
    return hex;
  }

  private static clamp(value: number): number {
    return Math.min(Math.max(value, CONSTANT.COLOR_MIN_VALUE), CONSTANT.COLOR_MAX_VALUE);
  }

  getHex(): string {
    return this.hex;
  }

  getRGB(): number[] {
    const red: string = this.getRedHex();
    const green: string = this.getGreenHex();
    const blue: string = this.getBlueHex();
    return [parseInt(red, CONSTANT.HEX_BASE), parseInt(green, CONSTANT.HEX_BASE), parseInt(blue, CONSTANT.HEX_BASE)];
  }

  setHex(hex: string): void {
    let padding = 0;
    if (hex.indexOf('#') !== -1) {
        padding =  1;
    }
    if (hex.length === (CONSTANT.HEX_LENGTH + padding)) {
        if (COLOR_REGEX_WITH_HASHTAG.test(hex)) {
            this.hex = hex.toUpperCase();
        } else if (COLOR_REGEX_WITHOUT_HASHTAG.test(hex)) {
            this.hex = '#'.concat(hex).toUpperCase();
        }
    }
  }

  setRGB(rgb: number[]): void {
    if (rgb.length === 3) {
        rgb[0] = Color.clamp(rgb[0]);
        rgb[1] = Color.clamp(rgb[1]);
        rgb[2] = Color.clamp(rgb[2]);

        this.hex = '#';
        for (let i = 0; i < CONSTANT.BYTES_IN_HEX; i++) {
            this.hex += Color.rgbToHex(rgb[i]);
        }
    }
  }

  getRedHex(): string {
    return this.hex.slice(1, 3).toUpperCase();
  }

  getGreenHex(): string {
    return this.hex.slice(3, 5).toUpperCase();
  }

  getBlueHex(): string {
    return this.hex.slice(5).toUpperCase();
  }

  setRedHex(red: string): void {
    red = this.correctHexDigit(red);
    if (COLOR_REGEX_RGB_VALUE_IN_HEX.test(red)) {
      this.hex = this.hex.charAt(0) + red + this.hex.substr(3);
    }
  }

  setGreenHex(green: string): void {
    green = this.correctHexDigit(green);
    if (COLOR_REGEX_RGB_VALUE_IN_HEX.test(green)) {
      this.hex = this.hex.substr(0, 3) + green + this.hex.substr(5);
    }
  }

  setBlueHex(blue: string): void {
    blue = this.correctHexDigit(blue);
    if (COLOR_REGEX_RGB_VALUE_IN_HEX.test(blue)) {
      this.hex = this.hex.substr(0, 5) + blue;
    }
  }

  private correctHexDigit(n: string): string {
    if (n.length === 0) {
      return '00';
    } else if (n.length === 1) {
      return '0' + n;
    } else {
      return n;
    }
  }

  // Inspired from https://bit.ly/2UBCNIs, but heavily reajusted.

  // If bw is true, the function will return the closest to black or white
  // (pale colors will return black and dark colors will return white)

  getInvertedColor(bw: boolean): Color {
    const hex = this.getHex().slice(1);

    const endOfRed = 2;
    const endOfGreen = 4;
    const endOfBlue = 6;
    let red = parseInt(hex.slice(0, endOfRed), CONSTANT.HEX_BASE);
    let green = parseInt(hex.slice(endOfRed, endOfGreen), CONSTANT.HEX_BASE);
    let blue = parseInt(hex.slice(endOfGreen, endOfBlue), CONSTANT.HEX_BASE);

    if (bw) {
      // Factors from http://stackoverflow.com/a/3943023/112731
      const redConversionFactor = 0.299;
      const greenConversionFactor = 0.587;
      const blueConversionFactor = 0.114;
      const shadeLimit = 186;
      const blackOrWhite = (red * redConversionFactor + green * greenConversionFactor + blue * blueConversionFactor)
      > shadeLimit ? '#000000' : '#FFFFFF';

      return new Color(blackOrWhite);
    }

    // Invert color components
    red = CONSTANT.COLOR_MAX_VALUE - red;
    green = CONSTANT.COLOR_MAX_VALUE - green;
    blue = CONSTANT.COLOR_MAX_VALUE - blue;

    return new Color([red, green, blue]);
  }

  // Inspired from https://stackoverflow.com/questions/22692134/detect-similar-colours-from-hex-values
  isSimilarTo(otherColor: Color): boolean {
    // RGB of 'this' color
    const redOfThis = this.getRGB()[0];
    const greenOfThis = this.getRGB()[1];
    const blueOfThis = this.getRGB()[2];

    // RGB of 'otherColor' color
    const redOfOtherColor = otherColor.getRGB()[0];
    const greenOfOtherColor = otherColor.getRGB()[1];
    const blueOfOtherColor = otherColor.getRGB()[2];

    // Calculate differences between reds, greens and blues and limit differences between 0 and 1
    const redDifference = (CONSTANT.COLOR_MAX_VALUE - Math.abs(redOfThis - redOfOtherColor)) / CONSTANT.COLOR_MAX_VALUE;
    const greenDifference = (CONSTANT.COLOR_MAX_VALUE - Math.abs(greenOfThis - greenOfOtherColor)) / CONSTANT.COLOR_MAX_VALUE;
    const blueDifference = (CONSTANT.COLOR_MAX_VALUE - Math.abs(blueOfThis - blueOfOtherColor)) / CONSTANT.COLOR_MAX_VALUE;

    // 0 means opposit colors, 1 means same colors
    const isSameColorFactor = 0.98;
    const divisionFactor = 3;
    return (redDifference + greenDifference + blueDifference) / divisionFactor > isSameColorFactor;
  }

  isSimilarWithTolerance(color: Color | null, tolerance: number): boolean {
    if (color !== null) {
      if (tolerance === 0) {
          return color.getHex() === this.getHex();
      } else {
          const colorRGB = color.getRGB();
          const curentRGB = this.getRGB();
          const difference =
            Math.abs(colorRGB[0] - curentRGB[0]) +
            Math.abs(colorRGB[1] - curentRGB[1]) +
            Math.abs(colorRGB[2] - curentRGB[2]) ;
          return difference <= ((tolerance / 100) * (CONSTANT.COLOR_MAX_VALUE * CONSTANT.BYTES_IN_HEX));
      }
    }
    return false;
  }
}
