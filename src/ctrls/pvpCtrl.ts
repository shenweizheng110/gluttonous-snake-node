import * as Ws from 'ws';
import GameAPI from 'GameAPI';
import gameResult from '../game/gameResult';
import snakeStore from '../game/snakeStore';
import { getGameByRoomId, getScoreRank, endGame, addIntervalId } from '../game/gameStore';
import { generateBean, getAllBeans } from '../game/beanStore';
import { send } from '../common/util';
import Game from 'Game';
import { addPartClient, partClientBroadcast, removePartClient } from '../game/clientStore';

/**
 * 发送蛇节点数据
 */
const show: GameAPI.Show = (ws, roomId) => {
    /* send(ws, GameAPI.ApiResType.SHOW, gameResult(null, {
        snakeInfo: snakeStore.getSnakeByRoomId(roomId),
        beans: getAllBeans(roomId),
        rankList: getScoreRank(roomId)
    })); */
    partClientBroadcast('pvp', roomId, GameAPI.ApiResType.SHOW, {
        snakeInfo: snakeStore.getSnakeByRoomId(roomId),
        beans: getAllBeans(roomId),
        rankList: getScoreRank(roomId)
    });
};

/**
 * 处理移动
//  * todo 1. 游戏结束后将蛇转换为豆子
//  * todo 2. 保存记录，删除一系列缓存， 退出房间
 * @param payload 参数载荷
 */
const handleMove: GameAPI.HandleMove = async (ws, roomId) => {
    snakeStore.move(roomId);
    let gameOverUserIds = await snakeStore.validEatOrGameOver(roomId);
    if (gameOverUserIds.length !== 0) {
        partClientBroadcast('pvp', roomId, GameAPI.ApiResType.GAME_OVER, gameResult(null, gameOverUserIds));
    }
    let isAllOver = snakeStore.validIsAllOver(roomId);
    let ret = getGameByRoomId(roomId);
    if (ret.errMsg) {
        send(ws, GameAPI.ApiResType.ERROR, ret);
        return;
    }
    let gameItem: Game.GameItem = ret.data;
    show(ws, roomId);
    if (isAllOver) {
        clearInterval(gameItem.intervalId);
        addIntervalId(null, roomId);
        await endGame(roomId, null);
    }
};

/**
 * 初始化玩家的蛇
 * @param roomId 房间号
 * @param userId 用户id
 */
const initPvpUser: GameAPI.InitPvpUser = (ws, { roomId, userId, canvasWidth, canvasHeight }) => {
    canvasHeight = 800;
    canvasWidth = 1200;
    let ret = getGameByRoomId(roomId);
    if (ret.errMsg) {
        send(ws, GameAPI.ApiResType.ERROR, ret);
        return;
    }
    let gameItem: Game.GameItem = ret.data;
    if (!gameItem) {
        send(ws, GameAPI.ApiResType.ERROR, gameResult('对局已失效', null));
        return;
    }
    let userConfig = gameItem.users[userId] && gameItem.users[userId].userConfig;
    if (!userConfig) {
        send(ws, GameAPI.ApiResType.ERROR, gameResult('该用户未上传个人配置', null));
        return;
    }
    let isExist = snakeStore.validUserExist(roomId, userId);
    // 用户蛇不存在新增一个
    if (!isExist) {
        snakeStore.generateSnakeByUser(roomId, userId, userConfig, canvasWidth, canvasHeight);
        for (let i = 0; i < 30; i++) {
            generateBean(roomId, canvasWidth, canvasHeight);
        }
    }
    // 添加定时任务
    if (gameItem.intervalId === null) {
        let intervalId = setInterval(() => {
            handleMove(ws, roomId);
        }, 15);
        addIntervalId(intervalId, roomId);
    }
    show(ws, roomId);
};

const pvpCtrl = (wsEl: Ws) => {
    wsEl.onmessage = ({ data }) => {
        let payload: any = null;
        try {
            if (typeof JSON.parse((data as string)) !== 'object') {
                throw Error('The param is not a JSON string');
            }
            payload = JSON.parse((data as string));
        } catch (e) {
            send(wsEl, GameAPI.ApiResType.ERROR, {
                errMsg: e.toString(),
                data: null
            });
        }
        if (!payload.type) {
            send(wsEl, GameAPI.ApiResType.SUCCESS, {
                errMsg: 'The param need a type',
                data: null
            });
            return;
        }
        switch (payload.type) {
            case 'init':
                addPartClient('pvp', payload.data.roomId, payload.data.userId, wsEl);
                initPvpUser(wsEl, payload.data);
                break;
            case 'move':
                handleMove(wsEl, payload.data);
                break;
            case 'direction':
                let { roomId, userId, keyCode } = payload.data;
                snakeStore.changeDirection(roomId, userId, keyCode);
                break;
            case 'destorySpeedUp':
                snakeStore.destorySpeedUp(payload.data.roomId, payload.data.userId, payload.data.keyCode);
                break;
            case 'leaveGame':
                removePartClient('pvp', payload.data.roomId, payload.data.userId);
        }
    };
};

export default pvpCtrl;
