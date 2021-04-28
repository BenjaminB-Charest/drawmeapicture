import { Entry } from "./entry";

export interface Leaderboard {
    classicDay: Entry[];
    classicWeek: Entry[];
    classicMonth: Entry[];
    classicAll: Entry[];
    soloDay: Entry[];
    soloWeek: Entry[];
    soloMonth: Entry[];
    soloAll: Entry[];
}
