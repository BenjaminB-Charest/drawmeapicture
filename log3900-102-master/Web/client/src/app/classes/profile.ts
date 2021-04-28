export interface Profile {
        username: string;
        firstName: string;
        lastName: string;
        level: number;
        avatar: string;
        avatarLink: string;
        name: string;
        channels: string[];
        experience: number;
        selectedBadges: string[];
        money: number;
        unlockedAvatars: string[];
        unlockedBadges: string[];
        toggleMusic: boolean;
        toggleVP: boolean;
        isLoggedIn: boolean;
}
