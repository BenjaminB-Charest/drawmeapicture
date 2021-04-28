import { GameModes } from "./enums/game-modes";
import { GameStates } from "./enums/game-states";
import { PlayerPositions } from "./enums/player-positions";
import { PlayerStates } from "./enums/player-states";
import { Game } from "./interfaces/game";
import { POSITIONS_PPvPP, POSITIONS_RPvPP, POSITIONS_PPvRP, POSITIONS_RPvRP } from "./positions-by-round";
import * as admin from "firebase-admin";
import { Image } from "./interfaces/image";
import { GameDifficulty } from "./enums/game-difficulty";
import { Lobby } from "./interfaces/lobby";
import { User } from "./interfaces/user";
import { Channel } from "./interfaces/channel";
import { Stroke } from "./interfaces/stroke";
import { SoloGame } from "./interfaces/solo-game";
import { SoloGameStates } from "./enums/solo-game-states";
import { Personality } from "./enums/personality";
import { generateMessage, generateSoloMessage } from './virtual-messages';
import { Leaderboard } from "./interfaces/leaderboard";
import { Entry } from "./interfaces/entry";

const EASY_G1_TIMER = 45; // SRS 3.1.6.15
const NORMAL_G1_TIMER = 35; // SRS 3.1.6.15
const HARD_G1_TIMER = 30; // SRS 3.1.6.15

const EASY_G2_TIMER = 35; // SRS 3.1.6.16
const NORMAL_G2_TIMER = 25; // SRS 3.1.6.16
const HARD_G2_TIMER = 20; // SRS 3.1.6.16

const EASY_POINTS = 1; // SRS 3.1.6.8 (normal) and 3.1.7.6 (solo)
const NORMAL_POINTS = 2; // SRS 3.1.6.8 (normal) and 3.1.7.6 (solo)
const HARD_POINTS = 3; // SRS 3.1.6.8 (normal) and 3.1.7.6 (solo)

const LEVEL_UP_BONUS = 25; // SRS 3.1.17.1
const CLASSIC_LOSS_BONUS = 5; // SRS 3.1.15.3
const CLASSIC_WIN_BONUS = 10; // SRS 3.1.17.2
const SOLO_CORRECT_BONUS = 5 // SRS 3.1.17.3

const CLASSIC_PARTICIPANTS = 4;
const SHARE_KEY_LENGTH = 6;

const TEAM_A_ROBOT = "Alice [Robot]";
const TEAM_B_ROBOT = "Bob [Robot]";

const DRAWINGS_LIBRARY_COLLECTION = "drawings-library";
const LOBBIES_COLLECTION = "lobbies";
const GAMES_COLLECTION = "games";
const USERS_COLLECTION = "userProfile";
const CHANNELS_COLLECTION = "channels";
const STROKES_COLLECTION = "strokes";
const SOLO_GAMES_COLLECTION = "solo-games";
const MESSAGES_COLLECTION = "messages";

admin.initializeApp();

export function updateScore(gameData: Game, player: string): void {
  let currentPoints = gameData.scores.get(player);
  switch (gameData.difficulty) {
    case GameDifficulty.Easy:
      currentPoints! += EASY_POINTS;
      break;
    case GameDifficulty.Normal:
      currentPoints! += NORMAL_POINTS;
      break;
    case GameDifficulty.Hard:
      currentPoints! += HARD_POINTS;
      break;
  }
  gameData.scores.set(player, currentPoints!);
}

export async function getRandomImage(difficulty: GameDifficulty, excludeWord: string): Promise<Image> {
  return await admin.firestore().collection(DRAWINGS_LIBRARY_COLLECTION).where("difficulty", "==", difficulty).where("word", "!=", excludeWord.toLowerCase()).get().then((querySnapshot) => {
    let images = querySnapshot.docs.map(function (doc) {
      const image = doc.data() as Image;
      image.id = doc.id;
      return image;
    });
    const myImage = images[Math.floor(Math.random() * images.length)];
    return myImage;
  });
}

export async function getImageFromLibrary(imageId: string): Promise<Image | undefined> {
  return await admin.firestore().collection(DRAWINGS_LIBRARY_COLLECTION).doc(imageId).get().then((querySnapshot) => {
    const data = querySnapshot.data();

    if (data === undefined) {
      return undefined;
    }

    return {
      id: imageId,
      authorId: data!.authorId,
      word: data!.word,
      difficulty: data!.difficulty,
      hints: data!.hints,
      paths: data!.paths,
    };
  }) as Image;
}

export async function getLobby(lobbyId: string): Promise<Lobby | undefined> {
  return await admin.firestore().collection(LOBBIES_COLLECTION).doc(lobbyId).get().then((querySnapshot) => {
    const data = querySnapshot.data();

    if (data === undefined) {
      return undefined;
    }

    // Convert Firestore objects to Maps
    const players = data!.players;
    const playersMap = new Map<string, PlayerPositions>();
    for (const player of Object.keys(players)) {
      playersMap.set(player, (players[player] as PlayerPositions));
    }

    return {
      id: lobbyId,
      name: data!.name,
      gameId: data!.gameId,
      difficulty: data!.difficulty,
      host: data!.host,
      mode: data!.mode,
      players: playersMap,
      isPublic: data!.isPublic,
      shareKey: data!.shareKey,
    };
  }) as Lobby;
}

export async function getGame(gameId: string): Promise<Game | undefined> {
  return await admin.firestore().collection(GAMES_COLLECTION).doc(gameId).get().then((querySnapshot) => {
    const data = querySnapshot.data();

    if (data === undefined) {
      return undefined;
    }

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

    return {
      id: gameId,
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
    };
  }) as Game;
}

export async function getSoloGame(gameId: string): Promise<SoloGame | undefined> {
  return await admin.firestore().collection(SOLO_GAMES_COLLECTION).doc(gameId).get().then((querySnapshot) => {
    const data = querySnapshot.data();

    if (data === undefined) {
      return undefined;
    }

    return {
      id: gameId,
      host: data!.host,
      difficulty: data!.difficulty,
      currentImageId: data!.currentImageId,
      state: data!.state,
      correctAttempts: data!.correctAttempts,
      totalAttempts: data!.totalAttempts,
      start: data!.start,
      end: data!.end,
      score: data!.score
    }
  }) as SoloGame;
}

export async function creteLobby(lobbyData: Lobby): Promise<string> {
  return await admin.firestore().collection(LOBBIES_COLLECTION).add({
    name: lobbyData.name,
    gameId: lobbyData.gameId,
    difficulty: lobbyData.difficulty,
    host: lobbyData.host,
    mode: lobbyData.mode,
    players: convertMapToObject(lobbyData.players),
    isPublic: lobbyData.isPublic,
    shareKey: lobbyData.shareKey,
  }).then((docRef) => {
    return docRef.id;
  });
}

export async function createSoloGame(gameData: SoloGame): Promise<string> {
  return await admin.firestore().collection(SOLO_GAMES_COLLECTION).add({
    host: gameData.host,
    difficulty: gameData.difficulty,
    currentImageId: gameData.currentImageId,
    state: gameData.state,
    correctAttempts: gameData.correctAttempts,
    totalAttempts: gameData.totalAttempts,
    start: gameData.start,
    end: gameData.end,
    score: gameData.score
  })
    .then((docRef) => {
      return docRef.id;
    });
}

export async function createGame(gameData: Game): Promise<string> {
  return await admin.firestore().collection(GAMES_COLLECTION).add({
    difficulty: gameData.difficulty,
    mode: gameData.mode,
    currentImageId: gameData.currentImageId,
    host: gameData.host,
    nextEvent: gameData.nextEvent,
    players: convertMapToObject(gameData.players),
    roles: convertMapToObject(gameData.roles),
    scores: convertMapToObject(gameData.scores),
    start: gameData.start,
    state: gameData.state,
    round: gameData.round,
    users: gameData.users
  })
    .then((docRef) => {
      return docRef.id;
    });
}

export async function createChannel(channelData: Channel): Promise<void> {
  await admin.firestore().collection(CHANNELS_COLLECTION).doc(channelData.id).set({
    shareKey: channelData.shareKey,
    isPublic: channelData.isPublic,
    host: channelData.host,
    name: channelData.name
  });
}

export async function createStroke(strokeData: Stroke): Promise<void> {
  await admin.firestore().collection(STROKES_COLLECTION).doc(strokeData.id).set({
    color: strokeData.color,
    type: strokeData.type,
    size: strokeData.size,
    opacity: strokeData.opacity,
    path: strokeData.path,
    id: 0
  });
}

export async function updateLobby(lobbyData: Lobby): Promise<void> {
  await admin.firestore().collection(LOBBIES_COLLECTION).doc(lobbyData.id).set({
    gameId: lobbyData.gameId,
    name: lobbyData.name,
    difficulty: lobbyData.difficulty,
    host: lobbyData.host,
    mode: lobbyData.mode,
    players: convertMapToObject(lobbyData.players),
    isPublic: lobbyData.isPublic,
    shareKey: lobbyData.shareKey,
  });
}

export async function updateGame(gameData: Game): Promise<void> {
  await admin.firestore().collection(GAMES_COLLECTION).doc(gameData.id).set({
    difficulty: gameData.difficulty,
    mode: gameData.mode,
    currentImageId: gameData.currentImageId,
    host: gameData.host,
    nextEvent: gameData.nextEvent,
    players: convertMapToObject(gameData.players),
    roles: convertMapToObject(gameData.roles),
    scores: convertMapToObject(gameData.scores),
    start: gameData.start,
    state: gameData.state,
    round: gameData.round,
    users: gameData.users
  });
}

export async function updateSoloGame(gameData: SoloGame): Promise<void> {
  await admin.firestore().collection(SOLO_GAMES_COLLECTION).doc(gameData.id).set({
    host: gameData.host,
    difficulty: gameData.difficulty,
    currentImageId: gameData.currentImageId,
    state: gameData.state,
    correctAttempts: gameData.correctAttempts,
    totalAttempts: gameData.totalAttempts,
    start: gameData.start,
    end: gameData.end,
    score: gameData.score
  });
}

export async function saveScores(gameData: Game, team?: string): Promise<void> {
  const playersToSave = [];
  let totalTeamA = 0;
  let totalTeamB = 0;

  for (const [player, position] of gameData.players.entries()) {
    if (player !== TEAM_A_ROBOT && player !== TEAM_B_ROBOT) {
      if (team?.toUpperCase() === "A") {
        // Save only Team A's scores
        if (position == PlayerPositions.A1 || position == PlayerPositions.A2) {
          playersToSave.push(player);
          totalTeamA += gameData.scores.get(player)!;
        } else {
          gameData.scores.set(player, 0);
        }
      } else if (team?.toUpperCase() === "B") {
        // Save only Team B's scores
        if (position == PlayerPositions.B1 || position == PlayerPositions.B2) {
          playersToSave.push(player);
          totalTeamB += gameData.scores.get(player)!;
        } else {
          gameData.scores.set(player, 0);
        }
      } else if (team === undefined) {
        // Save everyone's scores
        playersToSave.push(player);
        if (position == PlayerPositions.A1 || position == PlayerPositions.A2) {
          totalTeamA += gameData.scores.get(player)!;
        } else {
          totalTeamB += gameData.scores.get(player)!;
        }
      }
    }
  }

  const teamAWin = totalTeamA >= totalTeamB;
  const teamBWin = totalTeamB >= totalTeamA;

  for (const player of playersToSave) {
    const playerData = await admin.firestore().collection(USERS_COLLECTION).doc(player).get().then((doc) => {
      return doc.data() as User;
    });
    if (player && playerData) {
      const oldXp = playerData.experience;
      const oldMoney = playerData.money;

      let newXp = oldXp;
      let newMoney = oldMoney;

      const position = gameData.players.get(player)!;
      if (teamAWin && (position == PlayerPositions.A1 || position == PlayerPositions.A2)) {
        newXp += CLASSIC_WIN_BONUS;
        newMoney += CLASSIC_WIN_BONUS;
      } else if (teamBWin && (position == PlayerPositions.B1 || position == PlayerPositions.B2)) {
        newXp += CLASSIC_WIN_BONUS;
        newMoney += CLASSIC_WIN_BONUS;
      } else {
        newXp += CLASSIC_LOSS_BONUS;
      }

      if (hasLevelledUp(oldXp, newXp)) {
        newMoney += LEVEL_UP_BONUS;
      }

      await admin.firestore().collection(USERS_COLLECTION).doc(player).update({ experience: newXp, money: newMoney });
    }
  }
}

export function getNextDuration(difficulty: GameDifficulty, nextRole: PlayerStates): number {
  if (nextRole == PlayerStates.GuessingFirst) {
    switch (difficulty) {
      case GameDifficulty.Easy:
        return EASY_G1_TIMER;
      case GameDifficulty.Normal:
        return NORMAL_G1_TIMER;
      case GameDifficulty.Hard:
        return HARD_G1_TIMER;
    }
  } else if (nextRole == PlayerStates.GuessingSecond) {
    switch (difficulty) {
      case GameDifficulty.Easy:
        return EASY_G2_TIMER;
      case GameDifficulty.Normal:
        return NORMAL_G2_TIMER;
      case GameDifficulty.Hard:
        return HARD_G2_TIMER;
    }
  }
  return 0;
}

export function getRole(mode: GameModes, round: number, position: PlayerPositions): PlayerStates {
  switch (mode) {
    case GameModes.Classic_PPvPP:
      return POSITIONS_PPvPP[position][round];
    case GameModes.Classic_RPvPP:
      return POSITIONS_RPvPP[position][round];
    case GameModes.Classic_PPvRP:
      return POSITIONS_PPvRP[position][round];
    case GameModes.Classic_RPvRP:
      return POSITIONS_RPvRP[position][round];
  }
  return PlayerStates.Waiting;
}

export function convertMapToObject(map: Map<any, any>): Object {
  return Array.from(map.entries()).reduce((main, [key, value]) => ({ ...main, [key]: value }), {});
}

export function shouldBeGuessing(gameData: Game, guessingUsername: string): boolean {
  if (gameData.roles.has(guessingUsername)) {
    if (gameData.state == GameStates.DrawAndGuessFirst) {
      return gameData.roles.get(guessingUsername) == PlayerStates.GuessingFirst;
    } else if (gameData.state == GameStates.DrawAndGuessSecond) {
      return gameData.roles.get(guessingUsername) == PlayerStates.GuessingSecond;
    }
  }
  return false;
}

export function isLobbyReady(lobbyData: Lobby): boolean {
  const isGameStarted = lobbyData.gameId !== "";
  const isHostAPlayer = lobbyData.players.has(lobbyData.host);
  const hasFourPlayers = lobbyData.players.size === CLASSIC_PARTICIPANTS;

  let playersHaveValidPositions = true;
  for (let i = PlayerPositions.A1; i <= PlayerPositions.B2; i++) {
    const findPositionInMap = Array.from(lobbyData.players.values()).includes(i);
    playersHaveValidPositions = playersHaveValidPositions && findPositionInMap;
  }

  return !isGameStarted && isHostAPlayer && hasFourPlayers && playersHaveValidPositions;
}

export function generateKey(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const charactersLength = characters.length;
  let key = "";
  for (let i = 0; i < SHARE_KEY_LENGTH; i++) {
    key += characters.substr(Math.floor((Math.random() * charactersLength) + 1), 1);
  }
  return key;
}

export async function generateUniqueShareKey(): Promise<string> {
  return await admin.firestore().collection(LOBBIES_COLLECTION).get().then((querySnapshot) => {
    const lobbies = querySnapshot.docs.map(function (doc) {
      return doc.data() as Lobby;
    });
    let newKey = generateKey();
    for (const lobby of lobbies) {
      while (lobby.shareKey === newKey) {
        newKey = generateKey();
      }
    }
    return newKey;
  });
}

export function positionPlayersByMode(playersMap: Map<string, PlayerPositions>, mode: GameModes, host: string): void {
  switch (mode) {
    case GameModes.Classic_PPvPP:
      playersMap.set(host, PlayerPositions.A1);
      break;
    case GameModes.Classic_RPvPP:
      playersMap.set(TEAM_A_ROBOT, PlayerPositions.A1);
      playersMap.set(host, PlayerPositions.A2);
      break;
    case GameModes.Classic_PPvRP:
      playersMap.set(TEAM_B_ROBOT, PlayerPositions.B1);
      playersMap.set(host, PlayerPositions.A1);
      break;
    case GameModes.Classic_RPvRP:
      playersMap.set(TEAM_A_ROBOT, PlayerPositions.A1);
      playersMap.set(TEAM_B_ROBOT, PlayerPositions.B1);
      playersMap.set(host, PlayerPositions.A2);
      break;
  }
}

export function areCreateLobbyParamsDefined(difficulty: any, host: any, isPublic: any, mode: any, name: any): boolean {
  return (difficulty !== undefined && host !== undefined &&
    isPublic !== undefined && mode !== undefined && name !== undefined);
}

export async function updateCorrectSoloGuess(gameData: SoloGame, correctGuesses: number, wrongGuesses: number): Promise<void> {
  gameData.correctAttempts += correctGuesses;
  gameData.totalAttempts += (correctGuesses + wrongGuesses);
  switch (gameData.difficulty) {
    case GameDifficulty.Easy:
      gameData.score += EASY_POINTS;
      break;
    case GameDifficulty.Normal:
      gameData.score += NORMAL_POINTS;
      break;
    case GameDifficulty.Hard:
      gameData.score += HARD_POINTS;
      break;
  }
  const image = await getImageFromLibrary(gameData.currentImageId);
  gameData.currentImageId = (await getRandomImage(gameData.difficulty, image!.word)).id;
}

export async function updateNoMoreSoloAttempts(gameData: SoloGame, wrongGuesses: number): Promise<void> {
  gameData.totalAttempts += wrongGuesses;
  const image = await getImageFromLibrary(gameData.currentImageId);
  gameData.currentImageId = (await getRandomImage(gameData.difficulty, image!.word)).id;
}

export async function endSoloGame(gameData: SoloGame, wrongGuesses: number): Promise<void> {
  gameData.totalAttempts += wrongGuesses;
  gameData.end = new Date();
  gameData.state = SoloGameStates.GemeEnd;

  const playerData = await admin.firestore().collection(USERS_COLLECTION).doc(gameData.host).get().then((doc) => {
    return doc.data() as User;
  });

  if (playerData) {
    const oldXp = playerData.experience;
    const oldMoney = playerData.money;

    const newXp = oldXp + gameData.correctAttempts * SOLO_CORRECT_BONUS;
    let newMoney = oldMoney + gameData.correctAttempts * SOLO_CORRECT_BONUS;

    if (hasLevelledUp(oldXp, newXp)) {
      newMoney += LEVEL_UP_BONUS;
    }

    await admin.firestore().collection(USERS_COLLECTION).doc(gameData.host).update({ experience: newXp, money: newMoney });
  }
}

export async function removeChannelFromProfiles(gameData: Game): Promise<void> {
  const lobby = await admin.firestore().collection(LOBBIES_COLLECTION).where("gameId", "==", gameData.id).limit(1).get().then((querySnapshot) => {
    let lobby = {} as Lobby;
    querySnapshot.docs.forEach((doc) => {
      lobby = doc.data() as Lobby;
    });
    return lobby;
  });
  for (const [player] of gameData.players.keys()) {
    if (player !== TEAM_A_ROBOT && player !== TEAM_B_ROBOT) {
      const channels = await admin.firestore().collection(USERS_COLLECTION).doc(player).get().then((querySnapshot) => {
        let channels = (querySnapshot.data() as User).channels;
        channels.filter((channel) => { channel !== lobby.shareKey });
        return channels;
      });
      await admin.firestore().collection(USERS_COLLECTION).doc(player).update({ channels: channels });
    }
  }
}

export function hasLevelledUp(oldXp: number, newXp: number): boolean {
  return Math.floor(newXp / 20) > Math.floor(oldXp / 20);
}

export async function sendRobotComment(gameData: Game): Promise<void> {
  const robot = getRobot(gameData);
  const personnality = getPersonnality(robot, gameData.id);
  let players = gameData.users;
  console.log("OLD PLAYERS: " + players);
  players = players.filter((player) => { return ((player != TEAM_A_ROBOT) && (player != TEAM_B_ROBOT)) });
  console.log("NEW PLAYERS: " + players);
  const chosenPlayer = players[Math.floor(Math.random() * players.length)];

  await admin.firestore().collection(USERS_COLLECTION).doc(chosenPlayer).get().then(async (querySnapshot) => {
    const user = querySnapshot.data() as User;
    user.id = querySnapshot.id;
    const message = await generateMessage(user, personnality);

    let channel = "";
    await admin.firestore().collection(LOBBIES_COLLECTION).where("gameId", "==", gameData.id).limit(1).get().then((querySnapshot) => {
      let lobby = {} as Lobby;
      querySnapshot.docs.forEach((doc) => {
        lobby = doc.data() as Lobby;
        lobby.id = doc.id;
      })
      channel = lobby.shareKey;
    });

    await admin.firestore().collection(MESSAGES_COLLECTION).add({
      channel: channel,
      content: message,
      senderID: robot,
      timeStamp: admin.firestore.FieldValue.serverTimestamp()
    });
  });
}

export async function sendSoloRobotComment(soloGameData: SoloGame): Promise<void> {
  const robot = TEAM_A_ROBOT;
  const personnality = getPersonnality(robot, soloGameData.id);
  const chosenPlayer = soloGameData.host;

  await admin.firestore().collection(USERS_COLLECTION).doc(chosenPlayer).get().then(async (querySnapshot) => {
    const user = querySnapshot.data() as User;
    user.id = querySnapshot.id;
    const message = await generateSoloMessage(user, personnality);

    let channelToUse = "";
    await admin.firestore().collection(CHANNELS_COLLECTION).doc(soloGameData.id).get().then((querySnapshot) => {
      let channel = querySnapshot.data() as Channel;
      channel.id = querySnapshot.id;
      channelToUse = channel.shareKey;
    });

    await admin.firestore().collection(MESSAGES_COLLECTION).add({
      channel: channelToUse,
      content: message,
      senderID: robot,
      timeStamp: admin.firestore.FieldValue.serverTimestamp()
    });
  });
}

export function getPersonnality(robot: string, gameId: string): Personality {
  const firstChar = gameId.charAt(0).toLowerCase();
  if (robot === TEAM_A_ROBOT) {
    if (firstChar >= "a" && firstChar <= "m") {
      return Personality.Sad;
    } else if (firstChar >= "n" && firstChar <= "z") {
      return Personality.Arrogant;
    } else {
      return Personality.Funny;
    }
  } else {
    if (firstChar >= "a" && firstChar <= "m") {
      return Personality.Arrogant;
    } else if (firstChar >= "n" && firstChar <= "z") {
      return Personality.Funny;
    } else {
      return Personality.Sad;
    }
  }
}

export function getRobot(gameData: Game): string {
  let hasAlice = false;
  let hasBob = false;
  let chosenRobot = "";

  gameData.users.forEach((user) => {
    if (user === TEAM_A_ROBOT) {
      hasAlice = true;
    } else if (user === TEAM_B_ROBOT) {
      hasBob = true;
    }
  });

  if ((!hasAlice && !hasBob) || (hasAlice && hasBob)) {
    if (gameData.round % 2 == 0) {
      chosenRobot = TEAM_A_ROBOT;
    } else {
      chosenRobot = TEAM_B_ROBOT;
    }
  } else if (hasAlice && !hasBob) {
    chosenRobot = TEAM_A_ROBOT;
  } else if (!hasAlice && hasBob) {
    chosenRobot = TEAM_B_ROBOT;
  }
  return chosenRobot;
}

export async function getLeaderboard(leaderboard: Leaderboard): Promise<void> {
  await updateClassicLeaderboard(leaderboard);
  await updateSoloLeaderboard(leaderboard);
}

export async function updateSoloLeaderboard(leaderboard: Leaderboard): Promise<void> {
  const allSoloGames = await getAllSoloGames();
  const top10SoloAll = getTop10SoloPlayers(allSoloGames);
  leaderboard.soloAll = top10SoloAll;

  const monthGames = filterSoloMonth(allSoloGames);
  const top10SoloMonth = getTop10SoloPlayers(monthGames);
  leaderboard.soloMonth = top10SoloMonth;

  const weekGames = filterSoloWeek(allSoloGames);
  const top10SoloWeek = getTop10SoloPlayers(weekGames);
  leaderboard.soloWeek = top10SoloWeek;

  const dayGames = filterSoloDay(allSoloGames);
  const top10SoloDay = getTop10SoloPlayers(dayGames);
  leaderboard.soloDay = top10SoloDay;
}

export async function updateClassicLeaderboard(leaderboard: Leaderboard): Promise<void> {
  const allClassicGames = await getAllClassicGames();
  const top10ClassicAll = getTop10Players(allClassicGames);
  leaderboard.classicAll = top10ClassicAll;

  const monthGames = filterMonth(allClassicGames);
  const top10ClassicMonth = getTop10Players(monthGames);
  leaderboard.classicMonth = top10ClassicMonth;

  const weekGames = filterWeek(allClassicGames);
  const top10ClassicWeek = getTop10Players(weekGames);
  leaderboard.classicWeek = top10ClassicWeek;

  const dayGames = filterDay(allClassicGames);
  const top10ClassicDay = getTop10Players(dayGames);
  leaderboard.classicDay = top10ClassicDay;
}

export function filterDay(games: Game[]): Game[] {
  const today = new Date();
  games = games.filter((game) => {
    const ms = (game.start as unknown as admin.firestore.Timestamp).toMillis();
    return (today.getTime() - (new Date(ms)).getTime()) < (1000 * 60 * 60 * 24);
  });
  return games;
}

export function filterWeek(games: Game[]): Game[] {
  const today = new Date();
  games = games.filter((game) => {
    const ms = (game.start as unknown as admin.firestore.Timestamp).toMillis();
    return (today.getTime() - (new Date(ms)).getTime()) < (1000 * 60 * 60 * 24 * 7);
  });
  return games;
}

export function filterMonth(games: Game[]): Game[] {
  const today = new Date();
  games = games.filter((game) => {
    const ms = (game.start as unknown as admin.firestore.Timestamp).toMillis();
    return (today.getTime() - (new Date(ms)).getTime()) < (1000 * 60 * 60 * 24 * 30);
  });
  return games;
}

export function getTop10Players(games: Game[]): Entry[] {
  const allPlayersMap = new Map<string, number>();
  games.forEach((game) => {
    for (const [player, score] of game.scores.entries()) {
      if (!allPlayersMap.has(player)) {
        allPlayersMap.set(player, score);
      } else {
        const oldScore = allPlayersMap.get(player)!;
        allPlayersMap.set(player, oldScore + score);
      }
    }
  });
  let allPlayersArray = Array.from(allPlayersMap, ([player, score]) => ({ player, score }));

  allPlayersArray.sort(function (x, y) {
    return y.score - x.score;
  });

  allPlayersArray = allPlayersArray.filter((element) => {
    return (element.player !== TEAM_A_ROBOT) && (element.player !== TEAM_B_ROBOT)
  });

  // if (allPlayersArray.length > 10) {
  //   allPlayersArray = allPlayersArray.slice(0, 10);
  // }

  return allPlayersArray as Entry[];
}

export async function getAllClassicGames(): Promise<Game[]> {
  let games = [] as Game[];
  await admin.firestore().collection(GAMES_COLLECTION).where("state", "==", 8).get().then((querySnapshot) => {
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
  });
  return games;
}

export async function getAllSoloGames(): Promise<SoloGame[]> {
  let soloGames = [] as SoloGame[];
  await admin.firestore().collection(SOLO_GAMES_COLLECTION).where("state", "==", 4).get().then((querySnapshot) => {
    querySnapshot.docs.forEach((doc) => {
      const soloGame = doc.data() as SoloGame;
      soloGame.id = doc.id;
      soloGames.push(soloGame);
    });
  });
  return soloGames;
}

export function getTop10SoloPlayers(soloGames: SoloGame[]): Entry[] {
  const allPlayersMap = new Map<string, number>();
  soloGames.forEach((game) => {
    if (!allPlayersMap.has(game.host)) {
      allPlayersMap.set(game.host, game.score);
    } else {
      const oldScore = allPlayersMap.get(game.host)!;
      allPlayersMap.set(game.host, oldScore + game.score);
    }
  });

  let allPlayersArray = Array.from(allPlayersMap, ([player, score]) => ({ player, score }));

  allPlayersArray.sort(function (x, y) {
    return y.score - x.score;
  });

  allPlayersArray = allPlayersArray.filter((element) => {
    return (element.player !== TEAM_A_ROBOT) && (element.player !== TEAM_B_ROBOT)
  });

  // if (allPlayersArray.length > 10) {
  //   allPlayersArray = allPlayersArray.slice(0, 10);
  // }

  return allPlayersArray as Entry[];
}

export function filterSoloDay(games: SoloGame[]): SoloGame[] {
  const today = new Date();
  games = games.filter((game) => {
    const ms = (game.start as unknown as admin.firestore.Timestamp).toMillis();
    return (today.getTime() - (new Date(ms)).getTime()) < (1000 * 60 * 60 * 24);
  });
  return games;
}

export function filterSoloWeek(games: SoloGame[]): SoloGame[] {
  const today = new Date();
  games = games.filter((game) => {
    const ms = (game.start as unknown as admin.firestore.Timestamp).toMillis();
    return (today.getTime() - (new Date(ms)).getTime()) < (1000 * 60 * 60 * 24 * 7);
  });
  return games;
}

export function filterSoloMonth(games: SoloGame[]): SoloGame[] {
  const today = new Date();
  games = games.filter((game) => {
    const ms = (game.start as unknown as admin.firestore.Timestamp).toMillis();
    return (today.getTime() - (new Date(ms)).getTime()) < (1000 * 60 * 60 * 24 * 30);
  });
  return games;
}
