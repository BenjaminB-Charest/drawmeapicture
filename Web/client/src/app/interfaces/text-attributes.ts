import { CharacterFont } from '../enums/character-font';
import { Alignment } from '../enums/text-alignement';

export interface TextAttributes {
    alignment: Alignment;
    font: CharacterFont;
    isItalic: boolean;
    isBold: boolean;
    size: number;
}
