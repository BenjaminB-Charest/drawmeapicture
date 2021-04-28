import { Stroke } from '../classes/stroke';

export interface Image {
  id: string;
  authorId: string;
  word: string;
  difficulty: string;
  hints: string[];
  paths: Stroke[];
}
