import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {

  layerCount: number;
  askForLayerCount: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
}
