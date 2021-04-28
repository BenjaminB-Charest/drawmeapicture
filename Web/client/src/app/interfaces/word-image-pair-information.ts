import { Stroke } from "../classes/stroke";

export interface WordImagePairInformation {
  id: string;
  authorId: string;
  word: string;
  difficulty: string;
  hints: string[];
  strokes: Stroke[];
}
