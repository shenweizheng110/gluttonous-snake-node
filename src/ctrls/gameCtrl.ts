import * as Ws from 'ws';
import GameAPI from 'GameAPI';
import gameResult from '../game/gameResult';
import Game from 'Game';
// import snakeBase from '../game/snakeStore';
import { enterRoom, prepare, getGameByRoomId, getAllGames, startOrEnd } from '../game/gameStore';
import * as joi from 'joi';
import { formatErrorBaseWs, send } from '../common/util';

let ws: Ws = null;

/**
 * 进入房间
 * @param roomId 房间号
 * @param userId 用户id
 */
const handleEnterRoom: GameAPI.HandleEnterRoom = (payload) => {
    const { error, value } = joi.validate(payload, {
        roomId: joi.string().required(),
        userId: joi.string().required(),
        userConfig: joi.required(),
        userInfo: joi.required()
    });
    if (error) {
        send(ws, GameAPI.ApiResType.ERROR, gameResult(formatErrorBaseWs(error), value));
        return;
    }
    let { roomId, userId, userConfig, userInfo } = value;
    let ret = enterRoom(roomId, userId, userConfig, userInfo);
    if (ret.errMsg) {
        send(ws, GameAPI.ApiResType.ERROR, ret);
        return;
    }
    send(ws, GameAPI.ApiResType.ENTER_ROOM, ret);
    send(ws, GameAPI.ApiResType.ROOM_GAME, getGameByRoomId(roomId));
};

/**
 * 进入游戏
 * @param roomId 房间号
 */
const handleStart: GameAPI.HandleStart = ({ roomId }) => {
    let ret = getGameByRoomId(roomId);
    if (ret.errMsg) {
        send(ws, GameAPI.ApiResType.ERROR, ret);
        return;
    }
    let gameItem: Game.GameItem = ret.data;
    let { users } = gameItem;
    let userIds: string[] = Object.keys(users);
    let hasUnPrepare = false;
    hasUnPrepare = userIds.some(key => {
        if (!gameItem.users[key].isPrepare) {
            hasUnPrepare = true;
            return true;
        }
    });
    if (hasUnPrepare) {
        send(ws, GameAPI.ApiResType.SUCCESS, gameResult('有人未准备'));
        return;
    }
    ret = startOrEnd(roomId, null);
    if (ret.errMsg) {
        send(ws, GameAPI.ApiResType.ERROR, ret);
        return;
    }
    // 发送进入游戏指令
    send(ws, GameAPI.ApiResType.START, gameResult());
};

/**
 * 获取房间内的用户
 * @param roomId 房间号
 */
const getRoomUsers: GameAPI.GetRoomUsers = ({ roomId }) => {
    send(ws, GameAPI.ApiResType.ROOM_GAME, getGameByRoomId(roomId));
};

/**
 * 进入房间准备
 * @param roomId 房间号
 * @param userId 用户id
 */
const handlePrepare: GameAPI.HandlePrepare = ({ roomId, userId }) => {
    let ret = prepare(roomId, userId);
    if (ret.errMsg) {
        send(ws, GameAPI.ApiResType.ERROR, ret);
        return;
    }
    // send(GameAPI.ApiResType.PREPARE, ret);
    getRoomUsers({ roomId });
};

const GameCtrl = (wsEl: Ws) => {
    ws = wsEl;
    ws.onmessage = ({ data }) => {
        let payload = null;
        try {
            if (typeof JSON.parse((data as string)) !== 'object') {
                throw Error('The param is not a JSON string');
            }
            payload = JSON.parse((data as string));
        } catch (e) {
            send(ws, GameAPI.ApiResType.ERROR, {
                errMsg: e.toString(),
                data: null
            });
        }
        if (!payload.type) {
            send(ws, GameAPI.ApiResType.SUCCESS, {
                errMsg: 'The param need a type',
                data: null
            });
            return;
        }
        switch (payload.type) {
            case 'enterRoom':
                handleEnterRoom(payload.data);
                break;
            case 'prepare':
                handlePrepare(payload.data);
                break;
            case 'start':
                handleStart(payload.data);
                break;
            case 'roomGame':
                getRoomUsers(payload.data);
                break;
            case 'all':
                send(ws, GameAPI.ApiResType.ALL, getAllGames());
                break;
        }
    };
};

export default GameCtrl;
