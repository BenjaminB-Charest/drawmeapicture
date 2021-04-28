import { Component, OnInit, ViewChild } from '@angular/core';
import { IgxCarouselComponent } from 'igniteui-angular';

@Component({
    selector: 'app-badge-tutorial',
    templateUrl: './badge-tutorial.component.html',
    styleUrls: ['./badge-tutorial.component.scss'],
    styles: [':host-context(.badge) .carousel-animation-wrapper{height: 2698px; width:535px;}'],
})
export class BadgeTutorialComponent implements OnInit {
    @ViewChild('carousel', { static: true }) carousel: IgxCarouselComponent;
    slides: any[];
    animations: string[] = ['slide', 'fade', 'none'];
    constructor() {
        this.slides = [];
    }

    addSlides(): void {
        this.slides.push(
            {
                description:
                    'Various badges can be earned in the game. The following description will be a summary of all the badges and how to get them.',
                heading: 'Introduction:',
                image: 'assets/tutorial-images/badge/intro.png',
            },
            {
                description: 'You have won 40 classic games. Congratulations, you are very good!',
                heading: 'BEAST MODE',
                image: 'assets/tutorial-images/badge/badge0.png',
            },
            {
                description: 'You have completed your first classic game. Happy to see you playing!',
                heading: 'WELCOME!',
                image: 'assets/tutorial-images/badge/badge1.png',
            },
            {
                description: 'You have completed a total of 5 games. Glad you are enjoying yourself',
                heading: 'NORMAL PERSON',
                image: 'assets/tutorial-images/badge/badge2.png',
            },
            {
                description: 'You have completed a total of 20 games. Wow you actually like this game?',
                heading: '🚨STOP PLAYING🚨',
                image: 'assets/tutorial-images/badge/badge3.png',
            },
            {
                description: 'You have won 20 classic games. You are well on your way to being the best!',
                heading: 'X-GAME MODE',
                image: 'assets/tutorial-images/badge/badge4.png',
            },
            {
                description: 'You have won 10 classic games. Keep playing to sharpen your skills!',
                heading: 'UNSTOPPABLE FORCE',
                image: 'assets/tutorial-images/badge/badge5.png',
            },
            {
                description: 'You have won 3 classic game. Welcome to Draw Me a Picture!',
                heading: 'DROP THE ROIDS',
                image: 'assets/tutorial-images/badge/badge6.png',
            },
            {
                description: 'You have completed a total of 50 games. An official gamer by all definitions!',
                heading: 'GET A LIFE',
                image: 'assets/tutorial-images/badge/badge7.png',
            },
            {
                description: 'You have completed a total of 10 games. Stop now.',
                heading: 'ADDICTED',
                image: 'assets/tutorial-images/badge/badge8.png',
            },
            {
                description: 'You have spent 30 minutes in the game. Alright, you like this game. Stay around for a while!',
                heading: 'WE LOVE YOU',
                image: 'assets/tutorial-images/badge/badge9.png',
            },
            {
                description: 'You have spent 1 hour in the game. Hey... Take a break',
                heading: 'GO OUTSIDE',
                image: 'assets/tutorial-images/badge/badge10.png',
            },
            {
                description: 'You have spent 10 minutes in the game. Careful, this game is addictive',
                heading: 'PLAY SOME MORE',
                image: 'assets/tutorial-images/badge/badge11.png',
            },
            {
                description: 'You have spent 3 hours in this game. Go outside, whats wrong with you?',
                heading: 'STOP DOING THIS',
                image: 'assets/tutorial-images/badge/badge12.png',
            },
            {
                description: 'Earned 250 Tokens. High roller incoming!!!',
                heading: 'STONK',
                image: 'assets/tutorial-images/badge/badge13.png',
            },
            {
                description: 'Earned 500 Tokens. Careful not to get mugged',
                heading: 'KEVIN OLEARY',
                image: 'assets/tutorial-images/badge/badge14.png',
            },
            {
                description: 'Earned 100 Tokens. One Benjamin Franklin coming your way!',
                heading: 'BENJAMIN FRANKLIN',
                image: 'assets/tutorial-images/badge/badge15.png',
            },
            {
                description: 'Earned 750 Tokens. Look at Mr. Money bags over here!',
                heading: 'JEFF BEZOS',
                image: 'assets/tutorial-images/badge/badge16.png',
            },
            {
                description: 'You have drawn 10 word-image pairs. Thank you for making this game more fun!',
                heading: 'CONTENT CREATOR',
                image: 'assets/tutorial-images/badge/badge17.png',
            },
            {
                description: 'You have drawn 5 word-image pairs. Your creations are appreciated.',
                heading: 'ARTIST',
                image: 'assets/tutorial-images/badge/badge18.png',
            },
            {
                description: 'Nice painting! Make more if you enjoyed making the last!',
                heading: 'PAINTER',
                image: 'assets/tutorial-images/badge/badge19.png',
            },
        );
    }

    ngOnInit(): void {
        this.addSlides();
    }
}
