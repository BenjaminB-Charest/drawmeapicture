import { AvatarType } from '../enums/avatar-type.enum';

export class AvatarDictionary {
    avatarMap: Map<string, string>;
    constructor() {
        this.avatarMap = new Map([
            [AvatarType.Woman, 'assets/avatar/avatar_init_femme.png'],
            [AvatarType.Man, 'assets/avatar/avatar_init_homme.png'],
            [AvatarType.Cat, 'assets/avatars/cat.svg'],
            [AvatarType.Dog, 'assets/avatars/dog.svg'],
            [AvatarType.Fox, 'assets/avatars/fox.svg'],
            [AvatarType.PandaBear, 'assets/avatars/panda_bear.svg'],
            [AvatarType.Flamingo, 'assets/avatars/flamingo.svg'],
            [AvatarType.Yak, 'assets/avatars/yak.svg'],
            [AvatarType.Koala, 'assets/avatars/koala.svg'],
            [AvatarType.Bee, 'assets/avatars/bee.svg'],
            [AvatarType.Giraffe, 'assets/avatars/giraffe.svg'],
            [AvatarType.PolarBear, 'assets/avatars/polar_bear.svg'],
            [AvatarType.Rhino, 'assets/avatars/rhino.svg'],
            [AvatarType.Monkey, 'assets/avatars/monkey.svg'],
            [AvatarType.Rabbit, 'assets/avatars/rabbit.svg'],
            [AvatarType.Lion, 'assets/avatars/lion.svg'],
            [AvatarType.Raccoon, 'assets/avatars/raccoon.svg'],
            [AvatarType.Octopus, 'assets/avatars/octopus.svg'],
            [AvatarType.Leopard, 'assets/avatars/leopard.svg'],
            [AvatarType.Elephant, 'assets/avatars/elephant.svg'],
            [AvatarType.RobotA, 'assets/avatars/robot_teamA.svg'],
            [AvatarType.RobotB, 'assets/avatars/robot_teamB.svg'],
            [AvatarType.Empty, 'assets/avatars/empty_avatar.svg'],
        ]);
    }
}
