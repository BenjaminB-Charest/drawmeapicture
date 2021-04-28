import { Component, OnInit, ViewChild } from '@angular/core';
import { IgxCarouselComponent } from 'igniteui-angular';

@Component({
    selector: 'app-word-image-pair-tutorial',
    templateUrl: './word-image-pair-tutorial.component.html',
    styleUrls: ['./word-image-pair-tutorial.component.scss'],
    styles: ['host:context(.wordImagePair) .mat-card{height:1293px; width:535px;}'],
})
export class WordImagePairTutorialComponent implements OnInit {
    @ViewChild('carousel', { static: true }) carousel: IgxCarouselComponent;
    slides: any[];
    animations: string[] = ['slide', 'fade', 'none'];
    constructor() {
        this.slides = [];
    }

    addSlides(): void {
        this.slides.push(
            {
                description: 'The player can choose to add a word-image pair in the game library.',
                heading: 'Introduction:',
                image: 'assets/tutorial-images/word/word1.png',
            },
            {
                description: 'The player can first add a word in the library.',
                heading: 'Word:',
                image: 'assets/tutorial-images/word/word2.png',
            },
            {
                description: 'The player can then add a difficulty in which the word will appear. Either in Classic or Solo Sprint Mode.',
                heading: 'Difficulty:',
                image: 'assets/tutorial-images/word/word3.png',
            },
            {
                description: 'The player can finally add 3 hints associated with the word.',
                heading: 'Hints:',
                image: 'assets/tutorial-images/word/word4.png',
            },
            {
                description: 'The player can now access to the drawing zone in order to create a drawing.',
                heading: 'Access to the drawing zone:',
                image: 'assets/tutorial-images/word/word5.png',
            },
            {
                description: 'In the drawing zone, the player can create a drawing with the pencil, erase and grid tool.',
                heading: 'Drawing zone-1:',
                image: 'assets/tutorial-images/word/word6.png',
            },
            {
                description:
                    'The player can then either choose to edit the previously entered informations, refresh the canvas or submit the drawing.',
                heading: 'Drawing zone-2:',
                image: 'assets/tutorial-images/word/word7.png',
            },
            {
                description:
                    'The player can then visualize the drawing and/or make changes. The Done button submits the word-image pair and add it in the library.',
                heading: 'Drawing zone-2:',
                image: 'assets/tutorial-images/word/word8.png',
            },
        );
    }

    ngOnInit(): void {
        this.addSlides();
    }
}
