import { Vec2 } from 'src/app/classes/vec2';
import { StrokeType } from 'src/app/enums/stroke-type.enum';

export interface Stroke {
        id: number;
        color: string;
        size: number;
        type: StrokeType;
        opacity: number;
        path: Vec2[];
}
