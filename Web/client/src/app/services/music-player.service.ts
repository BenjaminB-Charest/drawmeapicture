import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { FirebaseApiService } from './server/firebase-api.service';
import { UserService } from './server/user.service';

@Injectable({
  providedIn: 'root'
})
export class MusicPlayerService {
  audio: HTMLAudioElement;
  audioOn: boolean;
  musicToggle: Subscription;
  constructor(private firebaseAPI: FirebaseApiService, private userProfileService: UserService) {
    this.musicToggle = this.userProfileService.musicToggled.subscribe((val) => {
      this.audioOn = val;
      if (!val) {
        this.stopMusic();
      }
    });
  }

  toggleMusic(toggle: boolean): void {
    this.audioOn = toggle;
    if (toggle) {
      this.playMusic('assets/sounds/epic_music.mp3');
    } else {
      this.stopMusic();
    }
    this.firebaseAPI.toggleMusic(this.audioOn);
  }

  playMusic(srcPath: string): void {
      if (this.audio !== undefined) {
        this.stopMusic();
      }
      if (this.audioOn) {
        this.audio = new Audio();
        this.audio.crossOrigin = 'anonymous';
        this.audio.src = srcPath;
        this.audio.loop = true;
        this.audio.volume = 0.2;
        this.audio.load();
        this.audio.play();
      }
  }

  stopMusic(): void {
    this.audio.pause();
  }

}
