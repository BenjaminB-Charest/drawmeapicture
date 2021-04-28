import { Point } from "./point";

export interface Stroke {
    id: string,
    color: string,
    type: string,
    size: number,
    opacity: number,
    path: Point[]  
}
