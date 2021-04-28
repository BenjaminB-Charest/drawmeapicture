import { Personality } from "./enums/personality";
import { User } from "./interfaces/user";
import * as admin from "firebase-admin";
import { Game } from "./interfaces/game";
import { PlayerPositions } from "./enums/player-positions";
import { PlayerStates } from "./enums/player-states";
import { SoloGame } from "./interfaces/solo-game";

export async function generateMessage(player: User, personnality: Personality): Promise<string> {
    let games = [] as Game[];
    await admin.firestore().collection("games").where("users", "array-contains", player.id).where("state", "==", 8).get().then((querySnapshot) => {
        querySnapshot.docs.forEach((doc) => {
            const data = doc.data();

            // Convert Firestore objects to Maps
            const players = data!.players;
            const playersMap = new Map<string, PlayerPositions>();
            for (const player of Object.keys(players)) {
                playersMap.set(player, (players[player] as PlayerPositions));
            }

            const scores = data!.scores;
            const scoresMap = new Map<string, number>();
            for (const player of Object.keys(scores)) {
                scoresMap.set(player, (scores[player] as number));
            }

            const roles = data!.roles;
            const rolesMap = new Map<string, PlayerStates>();
            for (const player of Object.keys(roles)) {
                rolesMap.set(player, (roles[player] as PlayerStates));
            }

            const game = {
                id: doc.id,
                difficulty: data!.difficulty,
                currentImageId: data!.currentImageId,
                host: data!.host,
                mode: data!.mode,
                nextEvent: data!.nextEvent,
                players: playersMap,
                roles: rolesMap,
                scores: scoresMap,
                start: data!.start,
                state: data!.state,
                round: data!.round,
                users: data!.users
            } as Game;
            games.push(game);
        });
        games.sort(function (x, y) {
            const xDate = new Date(x.start).getTime();
            const yDate = new Date(y.start).getTime();
            return xDate - yDate;
        });
    });

    const randomChoice = Math.floor(Math.random() * 2);

    if (randomChoice === 0 && games.length > 0) {
        const randomVal = Math.round(Math.random());
        if (randomVal === 0) {
            switch (personnality) {
                case Personality.Funny:
                    const lastGame = games.pop();
                    const ne = (lastGame!.nextEvent as unknown as admin.firestore.Timestamp).toMillis();
                    const start = (lastGame!.start as unknown as admin.firestore.Timestamp).toMillis();
                    const timeDifference = Math.floor(((new Date(ne)).getTime() - (new Date(start)).getTime()) / 1000);
                    return funnyHasLastGame(player, timeDifference);
                case Personality.Sad:
                    const lastScore = games.pop()!.scores.get(player.id)!;
                    return sadHasLastGame(player, lastScore);
                default:
                    const score = games.pop()!.scores.get(player.id)!;
                    return arrogantHasLastGame(player, score);
            }
        } else {
            const randomGame = games[Math.floor(Math.random() * games.length)];
            let otherUser = randomGame.users[Math.floor(Math.random() * randomGame.users.length)];
            while (otherUser === player.id) {
                otherUser = randomGame.users[Math.floor(Math.random() * randomGame.users.length)];
            }
            switch (personnality) {
                case Personality.Funny:
                    return funnyHistory(player, otherUser);
                case Personality.Sad:
                    return sadHistory(player, otherUser);
                default:
                    return arrogantHistory(player, otherUser);
            }
        }
    } else if (randomChoice === 0 && games.length === 0) {
        switch (personnality) {
            case Personality.Funny:
                return funnyHasNoGame(player);
            case Personality.Sad:
                return sadHasNoGame(player);
            default:
                return arrogantHasNoGame(player);
        }
    } else {
        const randomVal = Math.round(Math.random());
        if (randomVal === 0) {
            switch (personnality) {
                case Personality.Funny:
                    let total = 0;
                    games.forEach((game) => {
                        total += game.scores.get(player.id)!;
                    });
                    return funnyTotalScore(player, total);
                case Personality.Sad:
                    const level = Math.floor(player.experience / 20) + 1;
                    return sadTotalScore(player, level);
                default:
                    let totalScore = 0;
                    games.forEach((game) => {
                        totalScore += game.scores.get(player.id)!;
                    });
                    return arrogantTotalScore(player, totalScore);
            }
        } else {
            switch (personnality) {
                case Personality.Funny:
                    return funnyCash(player, player.money);
                case Personality.Sad:
                    return sadCash(player, player.money);
                default:
                    return arrogantCash(player, player.money);
            }
        }
    }

}

function funnyHasLastGame(player: User, duration: number): string {
    return `Fun fact: ${player.id}'s last classic game lasted ${duration}s. That's 15s more than my ex.`;
}

function funnyHasNoGame(player: User): string {
    return `Fun fact: ${player.id}'s classic game history is cleaner than their browser's history.`;
}

function funnyTotalScore(player: User, score: number): string {
    return `Fun fact: If ${player.id} got 1$ for every time they scored in a classic game, they'd be $${score} rich today.`;
}

function funnyHistory(player: User, otherPlayer: string): string {
    return `Fun fact: ${player.id} and ${otherPlayer} already played together. Does anyone else feel the tension between them?`;
}

function funnyCash(player: User, cash: number): string {
    return `Fun fact: ${player.id} has ${cash} tokens. Imagine how cool that'd be if it was worth anyting!`;
}

function sadHasLastGame(player: User, score: number): string {
    return `Sad fact: My robot partner left me yesterday because he heard ${player.id} scored ${score} points in their last classic game.`;
}

function sadHasNoGame(player: User): string {
    return `Sad fact: ${player.id} played as many classic games as I have friends left. That is, zero.`;
}

function sadTotalScore(player: User, level: number): string {
    return `Sad fact: ${player.id} is level ${level}. Unfortunately, that's still less than the amount of COVID variants out there.`;
}

function sadHistory(player: User, otherPlayer: string): string {
    return `Sad fact: ${player.id} and ${otherPlayer} played other games together, but they still can't handle each other...`;
}

function sadCash(player: User, cash: number): string {
    return `Sad fact: ${player.id}' ${cash} tokens are worth about the same as a Pokemon card.`;
}

function arrogantHasLastGame(player: User, score: number): string {
    return `Arrogant fact: ${player.id} scored ${score} points last game. That was also their average in high school.`;
}

function arrogantHasNoGame(player: User): string {
    return `Arrogant fact: Okay guys, this is ${player.id}'s first classic game. Be careful not to scare them away.`;
}

function arrogantTotalScore(player: User, totalScore: number): string {
    return `Arrogant fact: Can you believe ${player.id} scored ${totalScore} points in total in classic games? Imagine if they finished high school instead...`;
}

function arrogantHistory(player: User, otherPlayer: string): string {
    return `Arrogant fact: ${otherPlayer} once had to deal with ${player.id} for 4 entire rounds! Can you image how annoying that must have been for ${otherPlayer}?`;
}

function arrogantCash(player: User, cash: number): string {
    return `Arrogant fact: ${player.id} has ${cash} tokens, but no friends in real life.`;
}

export async function generateSoloMessage(player: User, personnality: Personality): Promise<string> {
    let soloGames = [] as SoloGame[];
    let bestScore = 0;
    let avarageScore = 0;
    let mostCorrectGuesses = 0;
    await admin.firestore().collection("solo-games").where("host", "==", player.id).where("state", "==", 4).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const soloGame = {
                id: doc.id,
                host: data!.host,
                difficulty: data!.difficulty,
                currentImageId: data!.currentImageId,
                state: data!.state,
                correctAttempts: data!.correctAttempts,
                totalAttempts: data!.totalAttempts,
                start: data!.start,
                end: data!.end,
                score: data!.score
            } as SoloGame;
            if (soloGame.score > bestScore) {
                bestScore = soloGame.score;
            }
            if (soloGame.correctAttempts > mostCorrectGuesses) {
                mostCorrectGuesses = soloGame.correctAttempts;
            }
            soloGames.push(soloGame);
            avarageScore = (avarageScore + soloGame.score) / soloGames.length;
        });
        soloGames.sort(function (x, y) {
            const xDate = new Date(x.start).getTime();
            const yDate = new Date(y.start).getTime();
            return xDate - yDate;
        });
    });

    avarageScore = Math.round(avarageScore);

    const randomVal = Math.floor(Math.random() * 5);
    if (randomVal === 0) {
        // best score
        switch(personnality) {
            case Personality.Funny:
                return `Fun fact: Your best score in a solo game is ${bestScore}. I wanted to do a joke on that but the score speaks for itself.`;
            case Personality.Sad:
                return `Sad fact: Your all-time best score in a solo game is ${bestScore}. If only that could bring your dad back...`;
            default:
                return `Arrogant fact: I've once seen a toddler make the double of your best score in solo mode (which is ${bestScore} FYI).`;
        }
    } else if (randomVal === 1) {
        // average score
        switch(personnality) {
            case Personality.Funny:
                return `Fun fact: If God existed, he would look down on your avarage of ${avarageScore} in solo mode.`;
            case Personality.Sad:
                return `Sad fact: The intern who wrote this line was underpaid. Also, your average in solo mode is ${avarageScore}.`;
            default:
                return `Arrogant fact: There's a reason why your average solo score of ${avarageScore} is called 'average'. Because that's what it is.`;
        }
    } else if (randomVal === 2) {
        // most correct guesses
        switch(personnality) {
            case Personality.Funny:
                return `Fun fact: Can you believe you once guessed ${mostCorrectGuesses} words in a single game? Me neither.`;
            case Personality.Sad:
                return `Sad fact: Sometimes I think back of the good days when you could guess ${mostCorrectGuesses} words in a game. Then I wake up.`;
            default:
                return `Arrogant fact: Your highest amount of words guessed in a game (${mostCorrectGuesses}) is still lower than minimum wage in most US states.`;
        }
    } else if (randomVal === 3) {
        // cash
        switch(personnality) {
            case Personality.Funny:
                return `Fun fact: Your ${player.money} tokens could be worth an entire Bitcoin back in 2008!`;
            case Personality.Sad:
                return `Sad fact: I know how it feels to live with ${player.money} tokens, I too try to raize 3 kids by myself...`;
            default:
                return `Arrogant fact: The guy that tried to steal your ${player.money} tokens felt so bad he started you a GoFundMe campaign.`;
        }
    } else  {
        // level
        const level = Math.floor((player.experience / 20) + 1);
        switch(personnality) {
            case Personality.Funny:
                return `Fun fact: Imagine being level ${level} and thinking you're good at this game.`;
            case Personality.Sad:
                return `Sad fact: Whenever you think being level ${level} is a accomplishment, remember: it's not.`;
            default:
                return `Arrogant fact: Being level ${level} has it's perks: you can be bad and people don't care.`;
        }
    }
}
