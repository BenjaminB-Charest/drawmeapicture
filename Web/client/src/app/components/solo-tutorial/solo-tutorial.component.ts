import { Component, OnInit, ViewChild } from '@angular/core';
import { IgxCarouselComponent } from 'igniteui-angular';

@Component({
    selector: 'app-solo-tutorial',
    templateUrl: './solo-tutorial.component.html',
    styleUrls: ['./solo-tutorial.component.scss'],
    styles: [':host-context(.solo) .carousel-animation-wrapper{height:1505px;}'],
})
export class SoloTutorialComponent implements OnInit {
    @ViewChild('carousel', { static: true }) carousel: IgxCarouselComponent;
    slides: any[];
    animations: string[] = ['slide', 'fade', 'none'];
    constructor() {
        this.slides = [];
    }

    addSlides(): void {
        this.slides.push(
            {
                description: 'Solo Sprint is a game mode where you try to guess the most words before the timer runs out.',
                heading: 'Introduction:',
                image: 'assets/tutorial-images/solo/solo1.png',
            },
            {
                description: "Depending on the difficulty, the player have a limited time to guess the bot's drawing.",
                heading: 'Difficulty selection:',
                image: 'assets/tutorial-images/solo/solo2.png',
            },
            {
                description:
                    'On each good answer, the player wins points and time depending on the difficulty. The number of hints depends on the difficulty level. Accessing the hints does not take away any points.',
                heading: 'Game view:',
                image: 'assets/tutorial-images/solo/solo3.png',
            },
            {
                description:
                    'On each bad answer, the player loses an attempt. The number of attempts depends also on the difficulty. If no attempts are left, another drawing is shown.',
                heading: 'Game view - 1:',
                image: 'assets/tutorial-images/solo/solo4.png',
            },
            {
                description: 'The game finishes if the time runs out.',
                heading: 'End game:',
                image: 'assets/tutorial-images/solo/solo5.png',
            },
        );
    }

    ngOnInit(): void {
        this.addSlides();
    }
}
