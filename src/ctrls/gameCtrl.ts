import * as Ws from 'ws';
import GameAPI from 'GameAPI';
import gameResult from '../game/gameResult';
import Game from 'Game';
import { enterRoom, prepare, getGameByRoomId, getAllGames, start, delGame, delGameUser } from '../game/gameStore';
import * as joi from 'joi';
import { formatErrorBaseWs, send } from '../common/util';
import { delRoomById, updateRoomPeopleCount } from '../services/roomService';
import { addPartClient, removePartClient, partClientBroadcast } from '../game/clientStore';

/**
 * 进入房间
 * @param roomId 房间号
 * @param userId 用户id
 */
const handleEnterRoom: GameAPI.HandleEnterRoom = async (ws, payload) => {
    const { error, value } = joi.validate(payload, {
        roomId: joi.string().required(),
        userId: joi.string().required()
    });
    if (error) {
        send(ws, GameAPI.ApiResType.ERROR, gameResult(formatErrorBaseWs(error), value));
        return;
    }
    let { roomId, userId } = value;
    let ret = await enterRoom(roomId, userId);
    if (ret.errMsg) {
        send(ws, GameAPI.ApiResType.ERROR, ret);
        return;
    }
    let gameItem: Game.GameItem = getGameByRoomId(roomId).data;
    send(ws, GameAPI.ApiResType.ENTER_ROOM, ret);
    // send(ws, GameAPI.ApiResType.ROOM_GAME, getGameByRoomId(roomId));
    // partClientBroadcast(roomId, GameAPI.ApiResType.ROOM_GAME, getGameByRoomId(roomId));
    await updateRoomPeopleCount(roomId, Object.keys(gameItem.users).length);
};

/**
 * 进入游戏
 * @param roomId 房间号
 */
const handleStart: GameAPI.HandleStart = async (ws, { roomId }) => {
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
    ret = await start(roomId, null);
    if (ret.errMsg) {
        send(ws, GameAPI.ApiResType.ERROR, ret);
        return;
    }
    partClientBroadcast('game', roomId, GameAPI.ApiResType.START, gameResult());
    // 发送进入游戏指令
    // send(ws, GameAPI.ApiResType.START, gameResult());
};

/**
 * 获取房间内的用户
 * @param roomId 房间号
 */
const getRoomUsers: GameAPI.GetRoomUsers = ({ roomId }) => {
    // send(ws, GameAPI.ApiResType.ROOM_GAME, getGameByRoomId(roomId));
    partClientBroadcast('game', roomId, GameAPI.ApiResType.ROOM_GAME, getGameByRoomId(roomId));
};

/**
 * 进入房间准备
 * @param roomId 房间号
 * @param userId 用户id
 */
const handlePrepare: GameAPI.HandlePrepare = (ws, { roomId, userId }) => {
    let ret = prepare(roomId, userId);
    if (ret.errMsg) {
        send(ws, GameAPI.ApiResType.ERROR, ret);
        return;
    }
    getRoomUsers({ roomId });
};

/**
 * 处理离开房间
 * @param roomId 房间号
 */
const handleLeaveRoom = async (ws: Ws, { roomId, userId }: {roomId: any; userId: string}) => {
    let ret = getGameByRoomId(roomId);
    if (ret.errMsg) {
        send(ws, GameAPI.ApiResType.ERROR, ret);
        return;
    }
    let gameItem: Game.GameItem = ret.data;
    if (!gameItem) {
        return;
    }
    let { isStart, hostId } = gameItem;
    if (!isStart) {
        if (hostId === userId) {
            await delRoomById(roomId);
            delGame(roomId);
            partClientBroadcast('game', roomId, GameAPI.ApiResType.GO_HOME, gameResult());
            removePartClient('game', roomId);
        } else {
            delGameUser(roomId, userId);
            await updateRoomPeopleCount(roomId, Object.keys(gameItem.users).length);
            send(ws, GameAPI.ApiResType.GO_HOME, gameResult());
            removePartClient(roomId, userId);
            getRoomUsers({ roomId });
        }
    }
};

const GameCtrl = (wsEl: Ws) => {
    wsEl.onmessage = async ({ data }) => {
        let payload = null;
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
            send(wsEl, GameAPI.ApiResType.ERROR, {
                errMsg: 'The param need a type',
                data: null
            });
            return;
        }
        switch (payload.type) {
            case 'enterRoom':
                await handleEnterRoom(wsEl, payload.data);
                break;
            case 'prepare':
                handlePrepare(wsEl, payload.data);
                break;
            case 'start':
                handleStart(wsEl, payload.data);
                break;
            case 'roomGame':
                addPartClient('game', payload.data.roomId, payload.data.userId, wsEl);
                getRoomUsers(payload.data);
                break;
            case 'leaveRoom':
                handleLeaveRoom(wsEl, payload.data);
                break;
            case 'all':
                send(wsEl, GameAPI.ApiResType.ALL, getAllGames());
                break;
        }
    };
};

export default GameCtrl;
