import { Component, OnInit, ViewChild } from '@angular/core';
import { IgxCarouselComponent } from 'igniteui-angular';

@Component({
    selector: 'app-classic-tutorial',
    templateUrl: './classic-tutorial.component.html',
    styleUrls: ['./classic-tutorial.component.scss'],
    styles: [':host-context(.classic) .carousel-animation-wrapper{height: 3180px;}'],
})
export class ClassicTutorialComponent implements OnInit {
    @ViewChild('carousel', { static: true }) carousel: IgxCarouselComponent;
    slides: any[];
    animations: string[] = ['slide', 'fade', 'none'];
    constructor() {
        this.slides = [];
    }

    addSlides(): void {
        this.slides.push(
            {
                description: 'Classic Mode is a 2 vs 2 game mode with at least 1 human player on each team.',
                heading: 'Introduction:',
                image: 'assets/tutorial-images/classic/classic1.png',
            },
            {
                description: 'The player have the option of creating or joining a game.',
                heading: 'Choose an option:',
                image: 'assets/tutorial-images/classic/classic2.png',
            },
            {
                description: 'When creating a game, the player can provide a game name, choose if the game is public or private and the difficulty.',
                heading: 'Create a game:',
                image: 'assets/tutorial-images/classic/classic3.png',
            },
            {
                description: 'When joining a game, the player can join with a key.',
                heading: 'Join a game:',
                image: 'assets/tutorial-images/classic/classic4.png',
            },
            {
                description: 'The player can join a game by clicking on the Join Game Button',
                heading: 'Join a game - 1:',
                image: 'assets/tutorial-images/classic/classic5.png',
            },
            {
                description: 'The player can open the tutorial, mute or unmute the music, add or remove a bot and begin or quit the game.',
                heading: "Lobby - Creator's view:",
                image: 'assets/tutorial-images/classic/classic6.png',
            },
            {
                description: 'The player can open the tutorial, mute or unmute the music or quit the game.',
                heading: "Lobby - Joiner's view:",
                image: 'assets/tutorial-images/classic/classic7.png',
            },
            {
                description:
                    'When not guessing, the player have access on a variety of informations on the left pannel. Such as points, name, badges and turn of each player.',
                heading: 'Game view:',
                image: 'assets/tutorial-images/classic/classic8.png',
            },
            {
                description:
                    "When guessing, the player can guess the word. The player can also ask for hints. The hints doesn't hinder the player pointage. The player wins points depending on the difficulty.",
                heading: 'Game view - 1:',
                image: 'assets/tutorial-images/classic/classic9.png',
            },
            {
                description:
                    "When drawing, the player can have access to the pencil, eraser and the grid tool. The player can also use the color pad tool to change their pencil's color.",
                heading: 'Game view - 2:',
                image: 'assets/tutorial-images/classic/classic10.png',
            },
            {
                description: 'At the end of the fourth round, the game ends and the players can view the overall game statistics.',
                heading: 'End Game:',
                image: 'assets/tutorial-images/classic/classic11.png',
            },
        );
    }

    ngOnInit(): void {
        this.addSlides();
    }
}
