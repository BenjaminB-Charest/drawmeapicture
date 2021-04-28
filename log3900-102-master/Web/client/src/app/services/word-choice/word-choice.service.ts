import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class WordChoiceService {
    selectedWord: string;
    constructor() {
        this.selectedWord = '';
    }

    sendWord(word: string): void {
        this.selectedWord = word;
    }
}
