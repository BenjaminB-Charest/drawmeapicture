export class Stack<T> {

  private stack: T[];
  private readonly EMPTY_STACK_INDEX: number = -1;

  constructor() {
    this.stack = new Array<T>();
    this.stack = [];
  }

  delete(toDelete: T): void {
    if (this.stack.length > 0) {
      const indexToRemove = this.stack.indexOf(toDelete);
      if (indexToRemove !== this.EMPTY_STACK_INDEX) {
        this.stack.splice(indexToRemove, 1);
      }
    }
  }

  insert(toInsert: T, index: number): void {
    this.stack.splice(index, 0, toInsert);
  }

  pushBack(toAdd: T): void {
    this.stack.push(toAdd);
  }

  popBack(): T | undefined {
    if (this.stack.length >= 1) {
      return this.stack.splice(this.stack.length - 1, 1)[0];
    }
    return undefined;
  }

  clear(): void {
    const stackLength = this.stack.length;
    if (stackLength > 0) {
      this.stack.splice(0, this.stack.length);
    }
  }

  pushFront(toAdd: T): void {
    const slicedArray: T[] = this.stack.splice(0, this.stack.length);
    this.stack[0] = toAdd;
    for (const element of slicedArray) {
      this.stack.push(element);
    }
  }

  popFront(): T | undefined {
    if (this.stack.length >= 1) {
      const toReturn: T = this.stack[0];
      this.stack = this.stack.splice(1, this.stack.length);
      return toReturn;
    }
    return undefined;
  }

  getAll(): T[] { return this.stack; }

  size(): number { return this.stack.length; }

  isEmpty(): boolean { return this.stack.length === 0; }

  contains(element: T): boolean { return this.stack.indexOf(element) >= 0; }

  getLast(): T | undefined {
    if (this.stack.length > 0) {
      return this.stack[this.stack.length - 1];
    }
    return undefined;
  }

  getRoot(): T | undefined {
    if (this.stack.length > 0) {
      return this.stack[0];
    }
    return undefined;
  }
}
