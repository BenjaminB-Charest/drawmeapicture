import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ElementRef, Injectable, Renderer2 } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';
import * as CONSTANTS from 'src/app/classes/constants';
import { REGEX_EMAIL, REGEX_TITLE } from 'src/app/classes/regular-expressions';
import { ImageFilter } from 'src/app/enums/color-filter';
import { ImageExportType } from 'src/app/enums/export-type';
import { ImageFormat } from 'src/app/enums/image-format';
import { SVGProperties } from 'src/app/enums/svg-html-properties';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  canvas: HTMLCanvasElement; // where i bind my preview for canvas
  originalCanvas: HTMLCanvasElement;
  myDownload: ElementRef; // where i mimic the download click
  imageAfterDeserialization: HTMLImageElement; // transformed image through formula
  currentFormat: BehaviorSubject<ImageFormat>;
  currentFilter: BehaviorSubject<ImageFilter>;
  currentExportType: BehaviorSubject<ImageExportType>;
  isTitleValid: BehaviorSubject<boolean>;
  isEmailValid: BehaviorSubject<boolean>;

  private image: ElementRef<SVGElement>; // My actual svg
  private manipulator: Renderer2;
  private serialized: XMLSerializer;
  private cloneSVG: ElementRef<SVGElement>; // copy of SVG element to set filters on it
  private filtersMap: Map<ImageFilter, string>;

  constructor(private http: HttpClient, private snack: MatSnackBar) {
    this.currentFormat = new BehaviorSubject<ImageFormat>(ImageFormat.JPEG);
    this.currentFilter = new BehaviorSubject<ImageFilter>(ImageFilter.Aucun);
    this.currentExportType = new BehaviorSubject<ImageExportType>(ImageExportType.Téléchargement);
    this.isTitleValid = new BehaviorSubject<boolean>(false);
    this.isEmailValid = new BehaviorSubject<boolean>(false);
    this.serialized = new XMLSerializer();
    this.initializeMap();
  }

  initialize(manipulator: Renderer2, image: ElementRef<SVGElement>): void {
    this.manipulator = manipulator;
    this.image = image; // my actual SVG Element
  }

  validateTitle(title: string): void {
    this.isTitleValid.next(REGEX_TITLE.test(title));
  }

  validateEmail(email: string): void {
    this.isEmailValid.next(REGEX_EMAIL.test(email));
  }

  export(imageTitle: string): void {
    if (this.currentFormat.getValue() === ImageFormat.SVG) {
      this.applyFilterFomSvg();
      this.downloadSVG(imageTitle);
    } else {
      const context = this.originalCanvas.getContext('2d');
      if (context !== null) {
        this.applyFilterFromCanvas(context);
        this.downloadCorrectType(imageTitle);
      }
    }
  }

  email(imageTitle: string, email: string): void {
    if (this.currentFormat.getValue() === ImageFormat.SVG) {
      this.applyFilterFomSvg();
      this.sendEmail(imageTitle, email, this.deserializeImageToSvg(), 'svg').subscribe(() => {
        this.snack.open('Courriel envoyé avec succès', '', { duration: 3000 });
      }, (error: HttpErrorResponse) => {
        this.handleError(error);
      });
    } else {
      const context = this.originalCanvas.getContext('2d');
      if (context !== null) {
        this.applyFilterFromCanvas(context);

        let extension = '';
        if (this.currentFormat.getValue() === ImageFormat.JPEG) {
          this.imageAfterDeserialization.src = this.originalCanvas.toDataURL('image/jpeg');
          extension = 'jpeg';
        } else if (this.currentFormat.getValue() === ImageFormat.PNG) {
          this.imageAfterDeserialization.src = this.originalCanvas.toDataURL('image/png');
          extension = 'png';
        }

        this.sendEmail(imageTitle, email, this.imageAfterDeserialization.src, extension).subscribe(() => {
          this.snack.open('Courriel envoyé avec succès', '', { duration: 3000 });
        }, (error: HttpErrorResponse) => {
          this.handleError(error);
        });
      }
    }
  }

  sendEmail(imageTitle: string, email: string, imageData: string, ext: string): Observable<string> {
    return this.http.post(CONSTANTS.REST_API_EMAIL, {
      to: email,
      payload: imageData,
      extension: ext,
      title: imageTitle
    }, { responseType: 'text'});
  }

  handleError(error: HttpErrorResponse): void {
    switch (error.status) {
      case CONSTANTS.HTTP_STATUS_OK:
        this.snack.open('Courriel envoyé avec succès', '', { duration: 3000 });
        break;
      case CONSTANTS.HTTP_STATUS_BAD_REQUEST:
        this.snack.open('Adresse courriel invalide ou manquante', '', { duration: 3000 });
        break;
      case CONSTANTS.HTTP_STATUS_FORBIDDEN:
        this.snack.open('Clé API manquante ou invalide', '', { duration: 3000 });
        break;
      case CONSTANTS.HTTP_STATUS_UNPROCESSABLE:
        this.snack.open('Adresse courriel ou fichier joint manquant', '', { duration: 3000 });
        break;
      case CONSTANTS.HTTP_STATUS_TOO_MANY:
        this.snack.open('Quota d\'envoi de courriels dépassé', '', { duration: 3000 });
        break;
      case CONSTANTS.HTTP_STATUS_INTERNAL_ERROR:
        this.snack.open('Erreur interne au serveur d\'envoi', '', { duration: 3000 });
        break;
      default:
        this.snack.open('Erreur de communication avec le serveur', '', { duration: 3000 });
        break;
    }
  }

  drawPreview(firstCall: boolean): void {
    const contextBinded = this.canvas.getContext('2d');
    if (contextBinded !== null) {
      contextBinded.clearRect(0, 0, contextBinded.canvas.width, contextBinded.canvas.height);
      this.applyFilterForPreview(contextBinded);
      let scaleX = CONSTANTS.EXPORT_MAX_HEIGHT / this.originalCanvas.width;
      let scaleY = (CONSTANTS.EXPORT_MAX_WIDTH / this.originalCanvas.height) / 2;
      if (scaleX > 1) {
        scaleX = 1;
      }
      if (scaleY > 1) {
        scaleY = 1;
      }
      if (firstCall) {
        contextBinded.scale(scaleX, scaleY);
      }
      contextBinded.drawImage(this.originalCanvas, 0, 0);
    }
  }

  async SVGToCanvas(): Promise<void> {
    this.deserializeImage();
    this.imageAfterDeserialization.onload = () => {
      this.originalCanvas.width = this.imageAfterDeserialization.width;
      this.originalCanvas.height = this.imageAfterDeserialization.height;
      const context = this.originalCanvas.getContext('2d');
      if (context !== null) {
        context.drawImage(this.imageAfterDeserialization, 0, 0);
      }
      this.drawPreview(true);
    };
  }

  // formula of conversion from https://spin.atomicobject.com/2014/01/21/convert-svg-to-png/
  private deserializeImage(): void {
    let xml;
    this.imageAfterDeserialization = new Image();
    xml = this.serialized.serializeToString(this.image.nativeElement as unknown as Node);
    const svg64 = btoa(xml);
    const b64Start = 'data:image/svg+xml;base64,';
    const image64 = b64Start + svg64;
    this.imageAfterDeserialization.src = image64;
  }

  private applyFilterForPreview(ctx: CanvasRenderingContext2D): void {
    const tempFilter = this.filtersMap.get(this.currentFilter.getValue());
    if (tempFilter !== undefined) {
      ctx.filter = tempFilter;
    }
  }

  private applyFilterFromCanvas(ctx: CanvasRenderingContext2D): void {
    const tempFilter = this.filtersMap.get(this.currentFilter.getValue());
    if (tempFilter !== undefined) {
      ctx.filter = tempFilter;
      ctx.drawImage(this.imageAfterDeserialization, 0, 0);
    }
  }

  // theory from https://stackoverflow.com/questions/17527713/force-browser-to-download-image-files-on-click
  private downloadCorrectType(imageTitle: string): void {
    if (this.currentFormat.getValue() === ImageFormat.JPEG) {
      this.imageAfterDeserialization.src = this.originalCanvas.toDataURL('image/jpeg');
    } else if (this.currentFormat.getValue() === ImageFormat.PNG) {
      this.imageAfterDeserialization.src = this.originalCanvas.toDataURL('image/png');
    }

    this.myDownload.nativeElement.setAttribute('href', this.imageAfterDeserialization.src);
    const finalString = imageTitle + '.' + this.currentFormat.getValue().toString();
    this.myDownload.nativeElement.setAttribute('download', finalString);
  }

  // formula of conversion from https://spin.atomicobject.com/2014/01/21/convert-svg-to-png/
  private deserializeImageToSvg(): string {
    let xml;
    const cloneImageAfterDeserialization = new Image();
    xml = this.serialized.serializeToString(this.cloneSVG.nativeElement as unknown as Node); // Added SOMETHING HERE
    const svg64 = btoa(xml);
    const b64Start = 'data:image/svg+xml;base64,';
    const image64 = b64Start + svg64;
    return cloneImageAfterDeserialization.src = image64;
  }

  private initializeMap(): void {
    this.filtersMap = new Map();
    this.filtersMap.set(ImageFilter.Aucun, 'none');
    this.filtersMap.set(ImageFilter.Constraste, 'contrast(0.3)');
    this.filtersMap.set(ImageFilter.Teinté, 'hue-rotate(140deg)');
    this.filtersMap.set(ImageFilter.Négatif, 'invert(1)');
    this.filtersMap.set(ImageFilter.Sombre, 'grayscale(0.5)');
    this.filtersMap.set(ImageFilter.Sépia, 'sepia(5)');
  }

  private applyFilterFomSvg(): void {
    this.cloneSVG = new ElementRef<SVGElement>(this.image.nativeElement);
    (this.cloneSVG.nativeElement as Node ) = this.image.nativeElement.cloneNode(true);
    const background: SVGRectElement = this.manipulator.createElement(SVGProperties.rectangle, SVGProperties.nameSpace);
    this.manipulator.setAttribute(background, SVGProperties.width, this.image.nativeElement.getAttribute(SVGProperties.width) as string);
    this.manipulator.setAttribute(background, SVGProperties.height, this.image.nativeElement.getAttribute(SVGProperties.height) as string);
    this.manipulator.setAttribute(background, SVGProperties.fill, this.image.nativeElement.style.backgroundColor as string);
    this.cloneSVG.nativeElement.insertBefore(background, (this.cloneSVG.nativeElement.firstChild as ChildNode));
    const tempFilter = this.filtersMap.get(this.currentFilter.getValue());
    if (tempFilter !== undefined) {
      this.cloneSVG.nativeElement.setAttribute('filter', tempFilter);
    }
  }

  private downloadSVG(imageTitle: string): void {
    this.myDownload.nativeElement.setAttribute('href', this.deserializeImageToSvg());
    const finalString = imageTitle + '.svg';
    this.myDownload.nativeElement.setAttribute('download', finalString);
  }
}
