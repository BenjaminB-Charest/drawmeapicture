import { AvatarType } from '../enums/avatar-type.enum';
import { ShopAvatar } from '../interfaces/shop-avatar';

export class Shop {
    avatarMap: Map<string, ShopAvatar>;
    constructor() {
        this.avatarMap = new Map([
            [AvatarType.Bee, {
                name: 'Bee Avatar', price: 30, link: 'assets/avatars/bee.svg',
                avatar: AvatarType.Bee
            } as ShopAvatar],
            [AvatarType.Cat, {
                name: 'Cat Avatar', price: 30, link: 'assets/avatars/cat.svg',
                avatar: AvatarType.Cat
            } as ShopAvatar],
            [AvatarType.Dog, {
                name: 'Dog Avatar', price: 30, link: 'assets/avatars/dog.svg',
                avatar: AvatarType.Dog
            } as ShopAvatar],
            [AvatarType.Elephant, {
                name: 'Elephant Avatar', price: 30, link: 'assets/avatars/elephant.svg',
                avatar: AvatarType.Elephant
            } as ShopAvatar],
            [AvatarType.Flamingo, {
                name: 'Flamingo Avatar', price: 30, link: 'assets/avatars/flamingo.svg',
                avatar: AvatarType.Flamingo
            } as ShopAvatar],
            [AvatarType.Fox, {
                name: 'Fox Avatar', price: 30, link: 'assets/avatars/fox.svg',
                avatar: AvatarType.Fox
            } as ShopAvatar],
            [AvatarType.Giraffe, {
                name: 'Giraffe Avatar', price: 30, link: 'assets/avatars/giraffe.svg',
                avatar: AvatarType.Giraffe
            } as ShopAvatar],
            [AvatarType.Koala, {
                name: 'Koala Avatar', price: 30, link: 'assets/avatars/koala.svg',
                avatar: AvatarType.Koala
            } as ShopAvatar],
            [AvatarType.Leopard, {
                name: 'Leopard Avatar', price: 30, link: 'assets/avatars/leopard.svg',
                avatar: AvatarType.Leopard
            } as ShopAvatar],
            [AvatarType.Lion, {
                name: 'Lion Avatar', price: 30, link: 'assets/avatars/lion.svg',
                avatar: AvatarType.Lion
            } as ShopAvatar],
            [AvatarType.Monkey, {
                name: 'Monkey Avatar', price: 30, link: 'assets/avatars/monkey.svg',
                avatar: AvatarType.Monkey
            } as ShopAvatar],
            [AvatarType.Octopus, {
                name: 'Octopus Avatar', price: 30, link: 'assets/avatars/octopus.svg',
                avatar: AvatarType.Octopus
            } as ShopAvatar],
            [AvatarType.PandaBear, {
                name: 'PandaBear Avatar', price: 30, link: 'assets/avatars/panda_bear.svg',
                avatar: AvatarType.PandaBear
            } as ShopAvatar],
            [AvatarType.PolarBear, {
                name: 'PolarBear Avatar', price: 30, link: 'assets/avatars/polar_bear.svg',
                avatar: AvatarType.PolarBear
            } as ShopAvatar],
            [AvatarType.Rabbit, {
                name: 'Rabbit Avatar', price: 30, link: 'assets/avatars/rabbit.svg',
                avatar: AvatarType.Rabbit
            } as ShopAvatar],
            [AvatarType.Raccoon, {
                name: 'Raccoon Avatar', price: 30, link: 'assets/avatars/raccoon.svg',
                avatar: AvatarType.Raccoon
            } as ShopAvatar],
            [AvatarType.Rhino, {
                name: 'Rhino Avatar', price: 30, link: 'assets/avatars/rhino.svg',
                avatar: AvatarType.Rhino
            } as ShopAvatar],
            [AvatarType.Yak, {
                name: 'Yak Avatar', price: 30, link: 'assets/avatars/yak.svg',
                avatar: AvatarType.Yak
            } as ShopAvatar],
        ]);
    }
}
