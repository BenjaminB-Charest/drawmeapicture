/**
 * Copyright notice: Component adapted from Lukas Marx's work
 * https://malcoded.com/posts/angular-color-picker/
 */

import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener,
  Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Color } from 'src/app/classes/color';
import * as CONSTANTS from 'src/app/classes/constants';

const CANVAS_CONTEXT = '2d';
const OPAQUE_WHITE_RGBA = 'rgba(255,255,255,1)';
const TRANSPARENT_WHITE_RGBA = 'rgba(255,255,255,0)';
const OPAQUE_BLACK_RGBA = 'rgba(0,0,0,1)';
const TRANSPARENT_BLACK_RGBA = 'rgba(0,0,0,0)';
const MAX_CROSS_OFFSET = 10;
const MIN_CROSS_OFFSET = 2;

@Component({
  selector: 'app-color-palette',
  templateUrl: './color-palette.component.html',
  styleUrls: ['./color-palette.component.scss']
})
export class ColorPaletteComponent implements AfterViewInit, OnChanges {

  @Input()
  initialColor: Color;

  @Output()
  newColor: EventEmitter<Color>;

  @ViewChild('canvas', {static: true})
  canvasValue: ElementRef;

  private ctx: CanvasRenderingContext2D;
  private currentSelectedPosition: {x: number, y: number};
  private isMouseDown: boolean;
  // tslint:disable-next-line: typedef | Reason : typedef is inferrable (number)
  private CROSS_WIDTH = 4;

  constructor() {
    this.newColor = new EventEmitter(true);
  }

  ngAfterViewInit(): void {
    this.display();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.initialColor) {
      this.display();
      const newPosition = this.currentSelectedPosition;
      if (newPosition) {
        this.newColor.emit(this.getColorAtPosition(newPosition.x, newPosition.y));
      }
    }
  }

  private display(): void {
    // Initialize ctx
    if (!this.ctx) {
      this.ctx = this.canvasValue.nativeElement.getContext(CANVAS_CONTEXT);
    }

    // Set palette dimensions to canvas size
    const width = this.canvasValue.nativeElement.width;
    const height = this.canvasValue.nativeElement.height;

    // Fill the background color inside the rectangle
    this.ctx.fillStyle = this.initialColor.getHex() || 'red';
    this.ctx.fillRect(0, 0, width, height);

    // Create the white gradient from opaque to transparent white
    const whiteGradient = this.ctx.createLinearGradient(0, 0, width, 0);
    whiteGradient.addColorStop(0, OPAQUE_WHITE_RGBA);
    whiteGradient.addColorStop(1, TRANSPARENT_WHITE_RGBA);

    // Add the white gradient layer on top of the background
    this.ctx.fillStyle = whiteGradient;
    this.ctx.fillRect(0, 0, width, height);

    // Create the black gradient from opaque to transparent black
    const blackGradient = this.ctx.createLinearGradient(0, 0, 0, height);
    blackGradient.addColorStop(1, OPAQUE_BLACK_RGBA);
    blackGradient.addColorStop(0, TRANSPARENT_BLACK_RGBA);

    // Add the black gradient layer on top of the white gradient
    this.ctx.fillStyle = blackGradient;
    this.ctx.fillRect(0, 0, width, height);

    // Draw a cross surrounding the selected color
    if (this.currentSelectedPosition) {
      this.ctx.lineWidth = this.CROSS_WIDTH;
      this.ctx.strokeStyle = OPAQUE_WHITE_RGBA;

      this.ctx.beginPath();
      this.ctx.moveTo(this.currentSelectedPosition.x - MAX_CROSS_OFFSET, this.currentSelectedPosition.y);
      this.ctx.lineTo(this.currentSelectedPosition.x - MIN_CROSS_OFFSET, this.currentSelectedPosition.y);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(this.currentSelectedPosition.x + MIN_CROSS_OFFSET, this.currentSelectedPosition.y);
      this.ctx.lineTo(this.currentSelectedPosition.x + MAX_CROSS_OFFSET, this.currentSelectedPosition.y);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(this.currentSelectedPosition.x, this.currentSelectedPosition.y - MAX_CROSS_OFFSET);
      this.ctx.lineTo(this.currentSelectedPosition.x, this.currentSelectedPosition.y - MIN_CROSS_OFFSET);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(this.currentSelectedPosition.x, this.currentSelectedPosition.y + MIN_CROSS_OFFSET);
      this.ctx.lineTo(this.currentSelectedPosition.x, this.currentSelectedPosition.y + MAX_CROSS_OFFSET);
      this.ctx.stroke();
    }

  }

  private getColorAtPosition(x: number, y: number): Color {
    const imageData = this.ctx.getImageData(x, y, 1, 1).data;
    const hexValue = '#'
    + this.correctDigits(imageData[0].toString(CONSTANTS.HEX_BASE))
    + this.correctDigits(imageData[1].toString(CONSTANTS.HEX_BASE))
    + this.correctDigits(imageData[2].toString(CONSTANTS.HEX_BASE));
    return new Color(hexValue);
  }

  private correctDigits(n: string): string {
    return n.length > 1 ? n : '0' + n;
  }

  emitColor(x: number, y: number): void {
    const colorToEmit = this.getColorAtPosition(x, y);
    this.newColor.emit(colorToEmit);
  }

  @HostListener('window:mouseup', ['$event'])
  onMouseUp(evt: MouseEvent): void {
    this.isMouseDown = false;
  }

  onMouseMove(evt: MouseEvent): void {
    if (this.isMouseDown) {
      this.currentSelectedPosition = { x: evt.offsetX, y: evt.offsetY };
      this.display();
      this.emitColor(evt.offsetX, evt.offsetY);
    }
  }

  onMouseDown(evt: MouseEvent): void {
    this.isMouseDown = true;
    this.currentSelectedPosition = { x: evt.offsetX, y: evt.offsetY };
    this.display();
    this.newColor.emit(this.getColorAtPosition(evt.offsetX, evt.offsetY));
  }

}
