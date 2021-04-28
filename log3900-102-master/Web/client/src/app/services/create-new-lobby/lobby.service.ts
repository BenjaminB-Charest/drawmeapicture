import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import * as CONSTANTS from 'src/app/classes/constants';
import { Lobby } from 'src/app/interfaces/lobby';
import { NewLobbyInfo } from 'src/app/interfaces/new-lobby-info';
import { ChatService } from '../chat/chat.service';

@Injectable({
    providedIn: 'root',
})
export class LobbyService {
    lobbyInfos: NewLobbyInfo;
    activeLobby: Lobby;
    lobbyId: string;
    hasLeftLobby: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    constructor(private httpClient: HttpClient, private chatService: ChatService, private db: AngularFirestore) {}

    async setLobbyInformations(form: FormGroup): Promise<void> {
        this.lobbyInfos = {
            name: form.get('name')?.value,
            privacy: form.get('privacy')?.value,
            mode: form.get('mode')?.value,
            difficulty: form.get('difficulty')?.value,
        } as NewLobbyInfo;
        await this.createLobby();
    }

    private async createLobby(): Promise<void> {
        await this.httpClient
            .post(CONSTANTS.CLOUD_FUNCTIONS_ROOT + CONSTANTS.CREATE_LOBBY_ENDPOINT, {
                difficulty: this.lobbyInfos.difficulty,
                host: localStorage.getItem('username'),
                isPublic: this.lobbyInfos.privacy,
                mode: this.lobbyInfos.mode,
                name: this.lobbyInfos.name,
            })
            .toPromise()
            .then(async (res: any) => {
                this.lobbyId = res.data.lobbyId;
                await this.sleep(2000);
                await this.db
                    .collection('lobbies')
                    .doc(res.data.lobbyId)
                    .ref.get()
                    .then(querySnapshot => {
                        const lobby = querySnapshot.data() as Lobby;
                        this.chatService.joinExistingChannel(lobby.shareKey);
                    });
            });
    }

    async sleep(ms: number): Promise<void> {
        setTimeout(() => {}, ms);
    }
}
