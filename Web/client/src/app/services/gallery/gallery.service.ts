// import { HttpClient } from '@angular/common/http';
// import { ElementRef, Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import * as CONSTANTS from 'src/app/classes/constants';
// import { SVGProperties } from '../../enums/svg-html-properties';
// import { Image } from '../../interfaces/image';

// @Injectable({
//   providedIn: 'root'
// })
// export class GalleryService {

//   refToSvg: ElementRef<SVGElement>;

//   constructor(private http: HttpClient) {
//   }

//   loadImage(image: Image): boolean {
//     if (this.verifyImage(image)) {
//       this.refToSvg.nativeElement.setAttribute(SVGProperties.width, image.width as unknown as string);
//       this.refToSvg.nativeElement.setAttribute(SVGProperties.height, image.height as unknown as string);
//       this.refToSvg.nativeElement.style.backgroundColor = image.background;
//       this.refToSvg.nativeElement.innerHTML = image.innerHtml;
//       return true;
//     }
//     return false;
//   }

//   getAllImages(): Observable<Image[]> {
//     return this.http.get<Image[]>(CONSTANTS.REST_API_ROOT);
//   }

//   deleteImage(id: string): Observable<void> {
//     return this.http.delete<void>(`${CONSTANTS.REST_API_ROOT}/${id}`);
//   }

//   verifyImage(image: Image): boolean {
//     const validWidth = image.width !== null && image.width > 0;
//     const validHeight = image.height !== null && image.height > 0;
//     const validSerial = image.serial !== null && (image.serial).toString().includes(CONSTANTS.SVG_SERIAL_SIGNATURE);
//     const validHtml = image.innerHtml !== null && (image.innerHtml).toString().includes(CONSTANTS.SVG_HTML_TAG);
//     return validWidth && validHeight && validSerial && validHtml;
//   }

// }
