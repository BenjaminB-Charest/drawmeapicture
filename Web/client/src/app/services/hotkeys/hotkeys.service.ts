import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { Observable } from 'rxjs';

// How to user hotkey service
// 1- Create in the drawable tool component's constructor (public hotkeyService: HotkeysService)
// 2- Add the key listeners
// shift.j = shift + j , control can be used too
      // hotkeys.addShortcut({ keys: 'shift.j', description: 'Function description' }).subscribe(   (event)=>{
      //    what to do when the event happens
      //   });)

interface Options {
  // tslint:disable-next-line: no-any | Reason : Creates an error with typedef HTMLElement
  element: any;
  description: string;
  keys: string;
}

@Injectable({
  providedIn: 'root'
})

export class HotkeysService {

    defaults: Partial<Options> = {
      element: this.document
    };

    constructor(
      public eventManager: EventManager,
      @Inject(DOCUMENT) private document: Document) {
    }

    addShortcut(options: Partial<Options>): Observable<Event> {
      const merged = { ...this.defaults, ...options };
      const event = `keydown.${merged.keys}`;

      return new Observable((observer) => {
          const handler = (e: Event) => {
            e.preventDefault();
            observer.next(e);
          };

          const dispose = this.eventManager.addEventListener(
            merged.element, event, handler
          );
          return () => {
            dispose();
          };
      });
    }
}
