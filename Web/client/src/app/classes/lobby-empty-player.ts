import { AvatarType } from '../enums/avatar-type.enum';
import { AvatarDictionary } from './avatar-dictionary';
import { LobbyPlayerInterface } from './lobby-player-interface';

export class LobbyEmptyPlayer extends LobbyPlayerInterface {
    avatarDictionary: AvatarDictionary;
    constructor() {
        super();
        this.avatarDictionary = new AvatarDictionary();
        this.name = 'No Player';
        this.avatar = this.avatarDictionary.avatarMap.get(AvatarType.Empty) as string;
        this.badges = ['assets/badge/noBadge.svg', 'assets/badge/noBadge.svg', 'assets/badge/noBadge.svg'];
        this.isVP = true;
    }
}
