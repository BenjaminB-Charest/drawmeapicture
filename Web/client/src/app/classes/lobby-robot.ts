import { AvatarType } from '../enums/avatar-type.enum';
import { AvatarDictionary } from './avatar-dictionary';

export class LobbyRobot {
    avatarDictionary: AvatarDictionary;
    name: string;
    avatar: string;
    badges: string[];
    isVP: boolean;
    constructor(name: string, team: string) {
        this.avatarDictionary = new AvatarDictionary();
        this.name = name;
        if (team === 'A') {
            this.avatar = this.avatarDictionary.avatarMap.get(AvatarType.RobotA) as string;
        } else {
            this.avatar = this.avatarDictionary.avatarMap.get(AvatarType.RobotB) as string;
        }
        this.badges = [];
        this.isVP = true;
    }
}
