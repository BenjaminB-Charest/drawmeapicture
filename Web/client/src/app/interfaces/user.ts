export interface User {
  id: string;
  firstName: string;
  lastName: string;
  experience: number;
  avatar: string;
  unlockedAvatars: string[];
  badgeList: string[];
  toggleMusic: boolean;
  toggleVP: boolean;
  username: string;
  channels: string[];
}
