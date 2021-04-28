// source: https://stackblitz.com/edit/angular-resize-observer?file=src%2Fapp%2Fresize-observer.directive.ts
import { Directive, ElementRef, EventEmitter, OnDestroy, Output } from '@angular/core';
// import ResizeObserver from 'resize-observer-polyfill'; //not needed really since > Chrome 64

type ResizeObserverCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => void;

interface ResizeObserverEntry {
    readonly target: Element;
    readonly contentRect: DOMRectReadOnly;
}

interface ResizeObserver {
    observe(target: Element): void;
    unobserve(target: Element): void;
    disconnect(): void;
}

declare var ResizeObserver: {
  prototype: ResizeObserver;
  new(callback: ResizeObserverCallback): ResizeObserver;
};

interface ResizeObserver {
  observe(target: Element): void;
  unobserve(target: Element): void;
  disconnect(): void;
}

export default ResizeObserver;

const entriesMap = new WeakMap();

const ro = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (entriesMap.has(entry.target)) {
      const comp = entriesMap.get(entry.target);
      comp.resizeCallback(entry);
    }
  }
});

@Directive({ selector: '[resizeObserver]' })
export class ResizeObserverDirective implements OnDestroy {
  @Output()
  // tslint:disable-next-line: typedef | Reason : resize: EventEmitter throws a compilation error
  resize = new EventEmitter();

  constructor(private el: ElementRef) {
    const target = this.el.nativeElement;
    entriesMap.set(target, this);
    ro.observe(target);
  }

  // tslint:disable-next-line: no-any | Reason : unknwon typedef for entry
  resizeCallback(entry: any): void {
    this.resize.emit(entry);
  }

  ngOnDestroy(): void {
    const target = this.el.nativeElement;
    ro.unobserve(target);
    entriesMap.delete(target);
  }
}
