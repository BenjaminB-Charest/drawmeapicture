import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ElementRef, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import * as CONSTANTS from 'src/app/classes/constants';
import { REGEX_TAG, REGEX_TITLE } from 'src/app/classes/regular-expressions';
import { SVGProperties } from '../../enums/svg-html-properties';
import { Image } from '../../interfaces/image';

@Injectable({
  providedIn: 'root'
})
export class SaveServerService {
  private innerHtml: string;
  refToSvg: ElementRef<SVGElement>;

  constructor(
    private http: HttpClient,
    private snacks: MatSnackBar) {
      this.innerHtml = '';
  }

  checkTitleValidity(title: string): boolean {
    return REGEX_TITLE.test(title);
  }

  addTag(etiquette: string, data: Set<string>): boolean {
    if (this.checkTagValidity(etiquette)) {
      data.add(etiquette.toUpperCase());
      return true;
    }
    return false;
  }

  removeTag(etiquette: string, data: Set<string>): void {
    data.delete(etiquette);
  }

  handleError(error: HttpErrorResponse): void {
    if (error.status === CONSTANTS.HTTP_STATUS_OK) {
      this.snacks.open('Votre image a été sauvegardé avec succès', '', {duration: 1500});
    } else {
      // The backend returned an unsuccessful response code.
      this.snacks.open('Une erreur de communication a occuré, votre image n\'a pas pu être sauvegardé', '', {duration: 1800});
    }
  }

  addImage(title: string, tagsSet: Set<string>, imgSrc: string): Observable<Image> {
    let tags: string[];

    this.innerHtml = this.refToSvg.nativeElement.innerHTML;
    tags = [];
    tagsSet.forEach((e) => {
      tags.push(e);
    });
    return this.http.post<Image>(CONSTANTS.REST_API_ROOT,
      {title, tags, serial: imgSrc, innerHtml: this.innerHtml,
        width: this.refToSvg.nativeElement.getAttribute(SVGProperties.width),
        height: this.refToSvg.nativeElement.getAttribute(SVGProperties.height),
        background: this.refToSvg.nativeElement.style.backgroundColor
      }
    );
  }

  private checkTagValidity(tag: string): boolean {
    return REGEX_TAG.test(tag);
  }
}
