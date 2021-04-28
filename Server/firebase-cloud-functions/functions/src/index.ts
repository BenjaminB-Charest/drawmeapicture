import * as functions from "firebase-functions";
import { GameDifficulty } from "./enums/game-difficulty";
import { GameModes } from "./enums/game-modes";
import { GameStates } from "./enums/game-states";
import { PlayerPositions } from "./enums/player-positions";
import { PlayerStates } from "./enums/player-states";
import { SoloGameStates } from "./enums/solo-game-states";
import * as helper from "./helper";
import { Channel } from "./interfaces/channel";
import { Game } from "./interfaces/game";
import { Leaderboard } from "./interfaces/leaderboard";
import { Lobby } from "./interfaces/lobby";
import { SoloGame } from "./interfaces/solo-game";
import { Stroke } from "./interfaces/stroke";

// GET {base-url}/leaderboard
// response.code: 200 (OK)
// response.body: { leaderboard: Leaderboard }
exports.leaderboard = functions.https.onRequest(async (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  if (request.method === "OPTIONS") {
    // Send response to OPTIONS requests
    response.set("Access-Control-Allow-Methods", "*");
    response.set("Access-Control-Allow-Headers", "*");
    response.set("Access-Control-Max-Age", "3600");
    response.status(204).send("");
  } else {
    let leaderboard = {} as Leaderboard;

    await helper.getLeaderboard(leaderboard);

    response.status(200).json({ data: { leaderboard: leaderboard } });
  }});

// POST {base-url}/createSoloGame
// request.body: { host: string, difficulty: GameDIfficulty }
// response.code: 200 (Game was created) or 400 (Invalid body params)
// response.body: { gameId: string }
exports.createSoloGame = functions.https.onRequest(async (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  if (request.method === "OPTIONS") {
    // Send response to OPTIONS requests
    response.set("Access-Control-Allow-Methods", "*");
    response.set("Access-Control-Allow-Headers", "*");
    response.set("Access-Control-Max-Age", "3600");
    response.status(204).send("");
  } else {
    if (request.body.difficulty == undefined || request.body.host == undefined) {
      response.status(400).send("Invalid body params");
      return;
    }

    const imageId = (await helper.getRandomImage(request.body.difficulty as GameDifficulty, "")).id;

    const newSoloGame = {
      id: "",
      host: request.body.host,
      difficulty: request.body.difficulty as GameDifficulty,
      currentImageId: imageId,
      state: SoloGameStates.GameStart,
      correctAttempts: 0,
      totalAttempts: 0,
      start: new Date(),
      end: new Date('January 1, 1900 00:00:00'),
      score: 0
    } as SoloGame;

    const newSoloGameId = await helper.createSoloGame(newSoloGame);
    newSoloGame.id = newSoloGameId;

    const newShareKey = await helper.generateUniqueShareKey();

    // Create new chat channel
    const newChannel = {
      id: newSoloGameId,
      shareKey: newShareKey,
      isPublic: false,
      host: newSoloGame.host,
      name: `${newSoloGame.host}'s Game`
    } as Channel;

    await helper.createChannel(newChannel);

    await helper.sendSoloRobotComment(newSoloGame);

    response.status(200).json({ data: { gameId: newSoloGameId } });
  }
});

// POST {base-url}/correctSoloGuess
// request.body: { gameId: string, correctAttemptsThisRound: number, badAttemptsThisRound: number }
// response.code: 200 (Game was updated) or 400 (Invalid body params)
exports.correctSoloGuess = functions.https.onRequest(async (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");

  if (request.method === "OPTIONS") {
    // Send response to OPTIONS requests
    response.set("Access-Control-Allow-Methods", "*");
    response.set("Access-Control-Allow-Headers", "*");
    response.set("Access-Control-Max-Age", "3600");
    response.status(204).send("");
  } else {
    if (request.body.gameId == undefined ||
      request.body.correctAttemptsThisRound == undefined ||
      request.body.badAttemptsThisRound == undefined) {
      response.status(400).send("Invalid body params");
      return;
    }

    const gameData = await helper.getSoloGame(request.body.gameId);

    if (gameData == undefined) {
      response.status(400).send("Game not found");
      return;
    }

    if (gameData) {
      await helper.updateCorrectSoloGuess(gameData, parseInt(request.body.correctAttemptsThisRound), parseInt(request.body.badAttemptsThisRound));
      await helper.updateSoloGame(gameData);
      await helper.sendSoloRobotComment(gameData);
      response.status(200).json({ data: "Game was updated" });
    }
  }
});

// POST {base-url}/noMoreSoloAttempts
// request.body: { gameId: string, badAttemptsThisRound: number }
// response.code: 200 (Game was updated) or 400 (Invalid body params)
exports.noMoreSoloAttempts = functions.https.onRequest(async (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");

  if (request.method === "OPTIONS") {
    // Send response to OPTIONS requests
    response.set("Access-Control-Allow-Methods", "*");
    response.set("Access-Control-Allow-Headers", "*");
    response.set("Access-Control-Max-Age", "3600");
    response.status(204).send("");
  } else {
    if (request.body.gameId == undefined ||
      request.body.badAttemptsThisRound == undefined) {
      response.status(400).send("Invalid body params");
      return;
    }

    const gameData = await helper.getSoloGame(request.body.gameId);

    if (gameData == undefined) {
      response.status(400).send("Game not found");
      return;
    }

    if (gameData) {
      await helper.updateNoMoreSoloAttempts(gameData, parseInt(request.body.badAttemptsThisRound));
      await helper.updateSoloGame(gameData);
      await helper.sendSoloRobotComment(gameData);
      response.status(200).json({ data: "Game was updated" });
    }
  }
});

// POST {base-url}/endSoloGame
// request.body: { gameId: string, badAttemptsThisRound: number }
// response.code: 200 (Game is done) or 400 (Invalid body params)
exports.endSoloGame = functions.https.onRequest(async (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");

  if (request.method === "OPTIONS") {
    // Send response to OPTIONS requests
    response.set("Access-Control-Allow-Methods", "*");
    response.set("Access-Control-Allow-Headers", "*");
    response.set("Access-Control-Max-Age", "3600");
    response.status(204).send("");
  } else {
    if (request.body.gameId == undefined ||
      request.body.badAttemptsThisRound == undefined) {
      response.status(400).send("Invalid body params");
      return;
    }

    const gameData = await helper.getSoloGame(request.body.gameId);

    if (gameData == undefined) {
      response.status(400).send("Game not found");
      return;
    }

    if (gameData) {
      await helper.endSoloGame(gameData, parseInt(request.body.badAttemptsThisRound));
      await helper.updateSoloGame(gameData);
      response.status(200).json({ data: "Game was updated" });
    }
  }
});

// POST {base-url}/createLobby
// request.body: { difficulty: GameDifficulty, host: string, isPublic: boolean, mode: GameModes, name: string }
// response.code: 200 (Lobby was created) or 400 (Invalid body params)
// response.body: { lobbyId: string }
exports.createLobby = functions.https.onRequest(async (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");

  if (request.method === "OPTIONS") {
    // Send response to OPTIONS requests
    response.set("Access-Control-Allow-Methods", "*");
    response.set("Access-Control-Allow-Headers", "*");
    response.set("Access-Control-Max-Age", "3600");
    response.status(204).send("");
  } else {
    if (!helper.areCreateLobbyParamsDefined(request.body.difficulty, request.body.host,
      request.body.isPublic, request.body.mode, request.body.name)) {
      response.status(400).send("Invalid body params");
      return;
    }

    const playersMap = new Map<string, PlayerPositions>();
    // Host will always be on position 2, no matter the game mode
    playersMap.set(request.body.host, PlayerPositions.A2);
    const newShareKey = await helper.generateUniqueShareKey();
    const isPublic = (request.body.isPublic == "true") ? true : false;

    const newLobby = {
      id: "",
      name: request.body.name,
      gameId: "",
      difficulty: (request.body.difficulty as GameDifficulty),
      host: request.body.host,
      mode: (request.body.mode as GameModes),
      players: playersMap,
      isPublic: isPublic,
      shareKey: newShareKey,
    } as Lobby;

    const newLobbyId = await helper.creteLobby(newLobby);

    // Create new chat channel
    const newChannel = {
      id: newLobbyId,
      shareKey: newLobby.shareKey,
      isPublic: false,
      host: newLobby.host,
      name: newLobby.name
    } as Channel;

    await helper.createChannel(newChannel);

    response.status(200).json({ data: { lobbyId: newLobbyId } });
  }
});

// POST {base-url}/createGameFromLobby
// request.body: { lobbyId: string }
// reponse.code: 200 (Game was created) or 400 (Invalid lobbyId) or 403 (Lobby not ready)
exports.createGameFromLobby = functions.https.onRequest(async (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");

  if (request.method === "OPTIONS") {
    // Send response to OPTIONS requests
    response.set("Access-Control-Allow-Methods", "*");
    response.set("Access-Control-Allow-Headers", "*");
    response.set("Access-Control-Max-Age", "3600");
    response.status(204).send("");
  } else {
    const lobbyData = await helper.getLobby(request.body.lobbyId);

    if (lobbyData === undefined) {
      response.status(400).send("Invalid lobbyId");
      return;
    }

    if (lobbyData) {
      if (!helper.isLobbyReady(lobbyData)) {
        response.status(403).send("Lobby not ready");
        return;
      }

      // Create roles map and users array
      const users = [];
      const rolesMap = new Map<string, PlayerStates>();
      for (const [player, position] of lobbyData.players.entries()) {
        const nextRole = helper.getRole(lobbyData.mode, 0, position);
        rolesMap.set(player, nextRole);
        users.push(player);
      }

      // Create scores map
      const scoresMap = new Map<string, number>();
      for (const player of lobbyData.players.keys()) {
        scoresMap.set(player, 0);
      }

      // Set next event
      const nextEvent = new Date();
      nextEvent.setSeconds(nextEvent.getSeconds() + 10);

      // Create new game
      const newGame = {
        id: "",
        host: lobbyData.host,
        currentImageId: (await helper.getRandomImage(lobbyData.difficulty, "")).id,
        mode: lobbyData.mode,
        state: GameStates.GameStart,
        difficulty: lobbyData.difficulty,
        round: 0,
        start: new Date(),
        nextEvent: nextEvent,
        players: lobbyData.players,
        roles: rolesMap,
        scores: scoresMap,
        users: users
      } as Game;

      lobbyData.gameId = await helper.createGame(newGame);

      // Create new active stroke
      const newStroke = {
        id: lobbyData.gameId,
        color: "000000",
        type: "",
        size: 1,
        opacity: 1,
        path: []
      } as Stroke;

      await helper.createStroke(newStroke);

      await helper.updateLobby(lobbyData);
      response.status(200).json({ data: "Game was created" });
    }
  }
});

// POST {base-url}/guessWord
// request.body: { gameId: string, guesserUsername: string, word: string }
// response.code: 200 (Game was updated) or 400 (Invalid gameId) or 403 (Not allowed to guess) or 404 (No image found)
// response.body: { isCorrect: boolean }
exports.guessWord = functions.https.onRequest(async (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");

  if (request.method === "OPTIONS") {
    // Send response to OPTIONS requests
    response.set("Access-Control-Allow-Methods", "*");
    response.set("Access-Control-Allow-Headers", "*");
    response.set("Access-Control-Max-Age", "3600");
    response.status(204).send("");
  } else {
    const gameData = await helper.getGame(request.body.gameId);
    let correctGuess = false;

    if (gameData === undefined) {
      response.status(400).send("Invalid gameId");
      return;
    }

    if (gameData) {
      if (!helper.shouldBeGuessing(gameData, request.body.guesserUsername)) {
        response.status(403).send("Not allowed to guess");
        return;
      }

      const currentImage = await helper.getImageFromLibrary(gameData.currentImageId);
      if (currentImage === undefined) {
        response.status(404).send("No image found");
        return;
      }
      if (currentImage) {
        correctGuess = currentImage.word.toLowerCase() == (request.body.word as string).toLowerCase();
        let nextState = GameStates.GameStart;
        let nextStateDuration = 0;

        switch (gameData.state) {
          case GameStates.DrawAndGuessFirst:
            if (correctGuess) {
              nextState = GameStates.DrawAndGuessFirstWon;
              nextStateDuration = 5;
              helper.updateScore(gameData, request.body.guesserUsername);
              for (const [player, position] of gameData.roles.entries()) {
                if (position === PlayerStates.DrawingPlayer || position === PlayerStates.DrawingRobot) {
                  helper.updateScore(gameData, player);
                }
              }
            } else {
              nextState = GameStates.DrawAndGuessSecond;
              nextStateDuration = helper.getNextDuration(gameData.difficulty, PlayerStates.GuessingSecond);
            }
            break;
          case GameStates.DrawAndGuessSecond:
            if (correctGuess) {
              nextState = GameStates.DrawAndGuessSecondWon;
              nextStateDuration = 5;
              helper.updateScore(gameData, request.body.guesserUsername);
              for (const [player, position] of gameData.roles.entries()) {
                if (position === PlayerStates.DrawingPlayer || position === PlayerStates.DrawingRobot) {
                  helper.updateScore(gameData, player);
                }
              }
            } else {
              nextState = GameStates.NoneHasGuessed;
              nextStateDuration = 5;
            }
            break;
          default:
            response.status(403).send("Not allowed to guess");
            return;
        }

        gameData.state = nextState;
        const nextEvent = new Date();
        nextEvent.setSeconds(nextEvent.getSeconds() + nextStateDuration);
        gameData.nextEvent = nextEvent;

        await helper.updateGame(gameData);
      }

      response.status(200).json({ data: { isCorrect: correctGuess } });
    }
  }
});

// POST {base-url}/timerExpired
// request.body: { gameId: string }
// response.code: 200 (Game was updated) or 400 (Invalid gameId)
exports.timerExpired = functions.https.onRequest(async (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");

  if (request.method === "OPTIONS") {
    // Send response to OPTIONS requests
    response.set("Access-Control-Allow-Methods", "*");
    response.set("Access-Control-Allow-Headers", "*");
    response.set("Access-Control-Max-Age", "3600");
    response.status(204).send("");
  } else {
    const gameData = await helper.getGame(request.body.gameId);

    if (gameData === undefined) {
      response.status(400).send("Invalid gameId");
      return;
    }

    let nextState = GameStates.GameEnd;
    let nextStateDuration = 0;

    if (gameData) {
      switch (gameData.state as GameStates) {
        case GameStates.GameStart:
          // Timer will always expire in GameStart.
          // We always want to continue to RoundStart.
          nextState = GameStates.RoundStart;
          nextStateDuration = 10;
          break;
        case GameStates.RoundStart:
          // Timer will always expire in RoundStart.
          // We always want to continue to DrawAndGuessFirst.
          nextState = GameStates.DrawAndGuessFirst;
          nextStateDuration = helper.getNextDuration(gameData.difficulty, PlayerStates.GuessingFirst);
          await helper.sendRobotComment(gameData);
          break;
        case GameStates.DrawAndGuessFirst:
          // We expect interruptions if G1 makes a guess (handled elsewhere).
          // Timer only expire if no guess was made.
          // In that case, we want to continue to DrawAndGuessSecond.
          nextState = GameStates.DrawAndGuessSecond;
          nextStateDuration = helper.getNextDuration(gameData.difficulty, PlayerStates.GuessingSecond);
          break;
        case GameStates.DrawAndGuessFirstWon:
          // Timer will always expire in DrawAndGuessFirstWon.
          // We always want to continue to RoundEnd.
          nextState = GameStates.RoundEnd;
          nextStateDuration = 5;
          break;
        case GameStates.DrawAndGuessSecond:
          // We expect interruptions if G2 makes a guess (handled elsewhere).
          // Timer will only expire if no guess was made.
          // In that case, we want to continue to NoneHasGuessed.
          nextState = GameStates.NoneHasGuessed;
          nextStateDuration = 5;
          break;
        case GameStates.DrawAndGuessSecondWon:
          // Timer will always expire in DrawAndGuessSecondWon.
          // We always want to continue to RoundEnd.
          nextState = GameStates.RoundEnd;
          nextStateDuration = 5;
          break;
        case GameStates.NoneHasGuessed:
          // Timer will always expire in NoneHasGuessed.
          // We always want to continue to RoundEnd.
          nextState = GameStates.RoundEnd;
          nextStateDuration = 5; 
          break;
        case GameStates.RoundEnd:
          // Timer will always expire in RoundEnd.
          // If this is the last round, we continue to GameEnd.
          // Otherwise, we return to RoundStart.
          const currentImage = await helper.getImageFromLibrary(gameData.currentImageId);
          gameData.currentImageId = (await helper.getRandomImage(gameData.difficulty, currentImage!.word)).id;
          if (gameData.round == 3) {
            nextState = GameStates.GameEnd;
            nextStateDuration = 20;
            await helper.saveScores(gameData);
          } else {
            nextState = GameStates.RoundStart;
            nextStateDuration = 10;

            // Update user role in preparation of next round
            gameData.round++;
            for (const [player, position] of gameData.players.entries()) {
              const nextRole = helper.getRole(gameData.mode, gameData.round, position);
              gameData.roles.set(player, nextRole);
            }
          }
          break;
        case GameStates.GameEnd:
          //await helper.removeChannelFromProfiles(gameData);
          console.log("Game is over");
          break;
      }

      gameData.state = nextState;
      const nextEvent = new Date();
      nextEvent.setSeconds(nextEvent.getSeconds() + nextStateDuration);
      gameData.nextEvent = nextEvent;

      await helper.updateGame(gameData);
      // response.set('Access-Control-Allow-Origin', '*');
      response.status(200).json({ data: "Game was updated" });
    }
  }
});

// POST {base-url}/quitGame
// request.body: { gameId: string, quitterUsername: string }
// response.code: 200 (Game was stopped) or 400 (Invalid params) or 403 (Quitter not in game)
exports.quitGame = functions.https.onRequest(async (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");

  if (request.method === "OPTIONS") {
    // Send response to OPTIONS requests
    response.set("Access-Control-Allow-Methods", "*");
    response.set("Access-Control-Allow-Headers", "*");
    response.set("Access-Control-Max-Age", "3600");
    response.status(204).send("");
  } else {
    const gameData = await helper.getGame(request.body.gameId);

    if (gameData === undefined || request.body.quitterUsername === undefined) {
      response.status(400).send("Invalid params");
      return;
    }

    if (gameData) {
      if (!gameData.players.has(request.body.quitterUsername)) {
        response.status(403).send("Quitter not in game");
        return;
      }

      gameData.state = GameStates.GameEnd;

      // Save only opponent team's scores
      const quitterPosition = gameData.players.get(request.body.quitterUsername);
      if (quitterPosition == PlayerPositions.A1 || quitterPosition == PlayerPositions.A2) {
        await helper.saveScores(gameData, "B");
      } else {
        await helper.saveScores(gameData, "A");
      }

      // Save ended game
      await helper.updateGame(gameData);
      //await helper.removeChannelFromProfiles(gameData);

      response.status(200).json({ data: "Game was stopped" });
    }
  }
});
