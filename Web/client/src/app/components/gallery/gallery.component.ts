// import { Component, OnInit } from '@angular/core';
// import { MatDialog, MatDialogRef } from '@angular/material/dialog';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { DomSanitizer } from '@angular/platform-browser';
// import { Router } from '@angular/router';
// import { TILE_WIDTH_PX } from 'src/app/classes/constants';
// import { DrawStackService } from 'src/app/services/draw-stack/draw-stack.service';
// import { ShortcutManagerService } from 'src/app/services/shortcut-manager/shortcut-manager.service';
// import { Image } from '../../interfaces/image';
// import { GalleryService } from '../../services/gallery/gallery.service';
// import { SaveServerService } from '../../services/save-server/save-server.service';
// import { WarningDialogComponent } from '../warning/warning-dialog.component';

// @Component({
//   selector: 'app-gallery',
//   templateUrl: './gallery.component.html',
//   styleUrls: ['./gallery.component.scss']
// })
// export class GalleryComponent implements OnInit {

//   private isValidTag: boolean;
//   tags: Set<string>;
//   private images: Image[];
//   resultImages: Image[];
//   tagName: string;
//   hoveredIndex: number;
//   isLoading: boolean;

//   constructor(private dialogRef: MatDialogRef<GalleryComponent>,
//               private saveService: SaveServerService,
//               private snacks: MatSnackBar,
//               private sanitizer: DomSanitizer,
//               private galleryService: GalleryService,
//               public router: Router,
//               private drawStackService: DrawStackService,
//               private shortcutManager: ShortcutManagerService,
//               private dialog: MatDialog
//   ) {
//     this.shortcutManager.disableShortcuts();
//     this.tags = new Set<string>();
//     /* tslint:disable-next-line: no-magic-numbers */
//     this.hoveredIndex = -1;
//     this.resultImages = [];
//     this.tagName = '';
//     this.isLoading = false;
//   }

//   ngOnInit(): void {
//     this.isLoading = true;
//     this.galleryService.getAllImages()
//       .subscribe((data) => {
//         this.images = data;
//         this.resultImages = this.images;
//         // bug fix to images url unsafe from https://github.com/angular/angular/issues/18950
//         this.images.forEach((e) => {
//           e.serial = this.sanitizer.bypassSecurityTrustResourceUrl(e.serial) as string;
//         });
//         this.isLoading = false;
//         this.snacks.open('Nous avons récupéré les images du serveur', '', {duration: 2000});
//       }, (error) => {
//         this.isLoading = false;
//         this.snacks.open('Une erreur de connexion est survenue', '', {duration: 3500});
//       });
//   }

//   onDialogClose(): void {
//     this.dialogRef.close();
//     history.state.goingToGallery = false;
//     if (history.state.comingFromEntryPoint) {
//       this.router.navigateByUrl('/');
//     }
//   }

//   addTag(tag: string): void {
//     this.isValidTag = this.saveService.addTag(tag, this.tags);
//     if (this.isValidTag) {
//       this.filterWithTag();
//       this.tagName = '';
//     }
//   }

//   removeTag(tag: string): void {
//     this.saveService.removeTag(tag, this.tags);
//     this.filterWithTag();
//   }

//   deleteImage(id: string): void {
//     this.isLoading = true;
//     this.galleryService.deleteImage(id).subscribe((data) => {
//       for (let i = 0 ; i < this.images.length ; ++i) {
//         if (id === this.images[i]._id) {
//           // on supprime l'élément de notre copie du serveur
//           this.images.splice(i, 1);
//         }
//       }
//       for (let i = 0 ; i < this.resultImages.length ; ++i) {
//         if (id === this.resultImages[i]._id) {
//           // on supprime l'élément de notre liste de resultats temporaire
//           this.resultImages.splice(i, 1);
//         }
//       }
//       this.isLoading = false;
//       this.snacks.open('Votre image a été supprimée du serveur.', '', {duration: 2000});
//     }, (error) => {
//       this.isLoading = false;
//       this.snacks.open('Une erreur de connxeion empêche la suppression.', '', {duration: 3500});
//     })
//     ;
//   }

//   loadImage(image: Image): void {
//     let isImageLoadable = true;
//     if (!this.drawStackService.isEmpty()) { // drawing is currenly opened
//       const warning = this.dialog.open(WarningDialogComponent, { disableClose: true });
//       if (warning !== undefined) {
//         warning.afterClosed().subscribe((result) => {
//           if (!result) {
//             // user decided to disregard current drawing
//             isImageLoadable = this.galleryService.loadImage(image);
//             this.drawStackService.addingNewSVG();
//           }
//         });
//       }
//     } else { // no drawing currently opened
//       isImageLoadable = this.galleryService.loadImage(image);
//     }

//     if (isImageLoadable) {
//       this.snacks.open('Image chargée avec succès.', '', {duration: 2000});
//       history.state.comingFromEntryPoint = false;
//       this.drawStackService.addingNewSVG();
//       this.onDialogClose();
//     } else {
//       this.snacks.open('Image corrompue. SVP effacer celle-ci et choisir une autre.', '', {duration: 3500});
//     }
//   }

//   getTableWidth(): string {
//     const rows = Math.floor((this.resultImages.length / 2)) +
//       (this.resultImages.length % 2); // we want 1-2 to take 1st row, 3-4 to take 2nd row...
//     const width = rows * TILE_WIDTH_PX;
//     return width + 'px';
//   }

//   onMouseEnter(index: number): void {
//     this.hoveredIndex = index;
//   }

//   onMouseLeave(): void {
//     /* tslint:disable-next-line: no-magic-numbers */
//     this.hoveredIndex = -1;
//   }

//   formatTagsArray(tags: string[]): string {
//     let list = '';
//     for (let i = 0; i < tags.length; i++) {
//       if (i === 0) {
//         list = tags[i];
//       } else {
//         list = list + ', ' + tags[i];
//       }
//     }
//     return 'tags : ' + list;
//   }

//   private filterWithTag(): void {
//     if (this.tags.size === 0) {
//       this.resultImages = this.images;
//       return;
//     }
//     this.resultImages = [];
//     // could have used a forEach but would add the same image more than one time if it has more
//     // than one corresponding ticket because u cant break a foreach loop in typescript
//     /* tslint:disable-next-line: prefer-for-of */
//     for (let i = 0; i < this.images.length; i++) {
//       /* tslint:disable-next-line: prefer-for-of */
//       for (let j = 0; j < this.images[i].tags.length; j++) {
//         if (this.tags.has(this.images[i].tags[j])) {
//           this.resultImages.push(this.images[i]);
//           break;
//         }
//       }
//     }
//     if (this.resultImages.length === 0) {
//       this.snacks.open('Aucun résultat ne correspond à votre recherche.', '', {duration: 3500});
//     }
//   }
// }
