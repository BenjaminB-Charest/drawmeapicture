import { Color } from '../classes/color';

export interface ShapeStyle {
  thickness: number;
  borderColor: Color;
  fillColor: Color;
  borderOpacity: number;
  fillOpacity: number;

  hasBorder: boolean;
  hasFill: boolean;

  nameDisplayDefault: string;
  nameDisplayOnShift: string;
}
