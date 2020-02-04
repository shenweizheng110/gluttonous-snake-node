import Game from 'Game';
// import Snake from 'Snake';
import gameResult from './gameResult';

let game: Game.GameStore = {};

/**
 * 进入房间准备
 * @param roomId 房间id
 * @param userId 用户id
 */
export const enterRoom: Game.EnterRoom = (roomId, userId, userConfig, userInfo) => {
    let gameItem = game[roomId];
    let userItem: Game.Gamer = {
        userId,
        score: 0,
        isPrepare: false,
        userConfig,
        userInfo,
        enterIndex: 1
    };
    if (gameItem) {
        userItem.enterIndex = ++gameItem.currentCount;
        gameItem.users[userId] = userItem;
        return gameResult();
    }
    game[roomId] = {
        roomId,
        currentCount: 1,
        users: {},
        hostId: userId,
        isStart: false,
        isEnd: false
    };
    userItem.isPrepare = true;
    game[roomId].users[userId] = userItem;
    return gameResult();
};

/**
 * 玩家准备
 * @param roomId 房间号
 * @param userId 用户id
 */
export const prepare: Game.GameWithUser = (roomId: string, userId: string) => {
    let gameItem = game[roomId];
    if (!gameItem) {
        return gameResult('游戏不存在');
    }
    let userItem = gameItem.users[userId];
    if (!userItem) {
        return gameResult('用户不存在');
    }
    userItem.isPrepare = !userItem.isPrepare;
    return gameResult();
};

/**
 * 结束一个游戏
 * @param roomId 房间号
 */
export const startOrEnd: Game.GameWithUser = (roomId: string) => {
    let gameItem = game[roomId];
    if (!gameItem) {
        return gameResult('对局不存在');
    }
    gameItem.isStart = !gameItem.isStart;
    if (!gameItem.isStart) {
        delete game[roomId];
    };
    return gameResult();
};

/**
 * 根据房间号获取该房间的游戏
 * @param roomId 房间号
 */
export const getGameByRoomId: Game.GameCommon = (roomId: string) => {
    return gameResult(null, game[roomId]);
};

/**
 * 获所有的对局
 */
export const getAllGames: Game.GetAllGames = () => {
    return gameResult(null, game);
};
