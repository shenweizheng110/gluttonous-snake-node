import Game from 'Game';
import gameResult from './gameResult';
import dao from '../dao';
import Settings from 'Settings';
import Snake from 'Snake';
import { Direction } from '../../types/Enum';
import { clearBeansByRoomId } from '../game/beanStore';
import { delRoomById } from '../services/roomService';

let game: Game.GameStore = {};

/**
 * 进入房间准备
 * @param roomId 房间id
 * @param userId 用户id
 */
export const enterRoom: Game.EnterRoom = async (roomId, userId) => {
    let userInfoRet = await dao.query('user.getBaseInfo', { userId });
    let userConfigRet = await dao.query('settings.getSettingsByUserId', { userId });
    let userConfig: Settings.UserConfig = userConfigRet[0];
    let gameItem = game[roomId];
    let directionCode: Snake.KeyCodeConfig = {};
    directionCode[userConfig.up] = Direction.Top;
    directionCode[userConfig.down] = Direction.Bottom;
    directionCode[userConfig.left] = Direction.Left;
    directionCode[userConfig.right] = Direction.Right;
    let { username, headImg, maxScore, maxDefeat } = userInfoRet[0];
    let userItem: Game.Gamer = {
        userId,
        username: username,
        cover: headImg,
        score: 0,
        maxScore,
        defeat: 0,
        maxDefeat,
        isPrepare: false,
        userConfig: {
            userId: userConfig.userId,
            colors: userConfig.nodeColor.split(';'),
            initDirection: (userConfig.initDirection as Direction),
            directionCode: directionCode,
            speedUp: userConfig.speedUp,
            initSpeed: userConfig.initSpeed,
            dangerColor: userConfig.dangerColor,
            eyeColor: userConfig.eyeColor
        },
        enterIndex: 1
    };
    if (gameItem && gameItem.isStart) {
        return gameResult('对局已开始', null);
    }
    if (gameItem) {
        userItem.enterIndex = ++gameItem.currentCount;
        gameItem.users[userId] = userItem;
        return gameResult();
    }
    game[roomId] = {
        roomId,
        id: null,
        currentCount: 1,
        users: {},
        hostId: userId,
        intervalId: null,
        isStart: false,
        isEnd: false
    };
    userItem.isPrepare = true;
    game[roomId].users[userId] = userItem;
    return gameResult();
};

/**
 * 离开房间
 * @param roomId 房间号
 * @param userId 用户id
 */
export const leaveRoom: Game.LeaveRoom = (roomId, userId) => {
    let gameItem = game[roomId];
    if (!gameItem) {
        return gameResult('对局不存在');
    }
    gameItem.hostId === userId
        ? delete game[roomId]
        : delete gameItem.users[userId];
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
 * 开始一个游戏
 * @param roomId 房间号
 */
export const start: Game.StartOrEnd = async (roomId: string) => {
    let gameItem = game[roomId];
    if (!gameItem) {
        return gameResult('对局不存在');
    }
    gameItem.isStart = true;
    let { insertId } = await dao.insert('record', {
        startTime: new Date()
    });
    gameItem.id = insertId;
    return gameResult();
};

/**
 * 结束一个游戏
 * @param roomId 房间号
 */
export const endGame: Game.StartOrEnd = async (roomId: string) => {
    let gameItem = game[roomId];
    if (!gameItem) {
        return gameResult('对局不存在');
    }
    gameItem.isEnd = true;
    let users = gameItem.users;
    let sortedArr = Object.keys(users)
        .map(userId => ({
            userId,
            compositeScore: users[userId].score * 0.6 + users[userId].defeat * 0.4
        }))
        .sort((val1, val2) => val1.compositeScore - val2.compositeScore);
    // 添加 mvp 字段
    let ret = await dao.update('record', {
        id: gameItem.id,
        mvpId: sortedArr[0].userId,
        endTime: new Date()
    });
    clearBeansByRoomId(roomId);
    delete game[roomId];
    await delRoomById((roomId as any));
    return gameResult(null, ret[0]);
};

/**
 * 根据房间号获取该房间的游戏
 * @param roomId 房间号
 */
export const getGameByRoomId: Game.GameCommon = (roomId: string) => {
    return gameResult(null, game[roomId] || null);
};

/**
 * 获所有的对局
 */
export const getAllGames: Game.GetAllGames = () => {
    return gameResult(null, game);
};

/**
 * 更新分数
 */
export const changeScore: Game.ChangeScore = (roomId, userId, score) => {
    game[roomId].users[userId].score = score;
};

/**
 * 新增击杀数
 * @param roomId 房间号
 * @param userId 用户id
 */
export const addDefeat: Game.AddDefeat = (roomId, userId) => {
    game[roomId].users[userId].defeat += 1;
};

/**
 * 获取分数排行榜
 * @param roomId 房间号
 * @param userId 用户id
 */
export const getScoreRank: Game.GetScoreRank = (roomId) => {
    let users = game[roomId].users;
    let sortedUsers = Object.keys(users)
        .map(userId => ({
            userId: userId,
            username: users[userId].username,
            score: users[userId].score
        }))
        .sort((val1, val2) => val2.score - val1.score);
    return sortedUsers;
};

/**
 * 记录用户的游戏数据
 * @param roomId 房间号
 * @param userId 用户id
 */
export const recordGameByUser: Game.RecordGameByUser = async (roomId, userId) => {
    let gameItem = game[roomId];
    if (!gameItem) {
        return gameResult('对局不存在');
    }
    let { score, defeat, maxScore, maxDefeat } = gameItem.users[userId];
    await dao.insert('record_user', {
        recordId: gameItem.id,
        userId,
        score,
        defeat,
        createTime: new Date(),
        updateTime: new Date()
    });
    await dao.update('user_game_info', {
        userId,
        maxScore: score > maxScore ? score : maxScore,
        maxDefeat: defeat > maxDefeat ? defeat : maxDefeat
    }, 'user_id');
};

export const delGame = (roomId: string) => {
    delete game[roomId];
};

export const delGameUser = (roomId: string, userId: string) => {
    delete game[roomId].users[userId];
};

export const addIntervalId = (intervalId: any, roomId: string) => {
    game[roomId].intervalId = intervalId;
};
