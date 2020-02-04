import * as Ws from 'ws';
import GameAPI from 'GameAPI';
import gameResult from '../game/gameResult';
import snakeStore from '../game/snakeStore';
import { getGameByRoomId } from '../game/gameStore';
import { generateBean, getAllBeans } from '../game/beanStore';
import { send } from '../common/util';
import Game from 'Game';

let ws: Ws = null;

/**
 * 发送蛇节点数据
 */
const show: GameAPI.Show = (roomId) => {
    send(ws, GameAPI.ApiResType.SHOW, gameResult(null, {
        snakeInfo: snakeStore.getSnakeByRoomId(roomId),
        beans: getAllBeans(roomId)
    }));
};

/**
 * 初始化玩家的蛇
 * @param roomId 房间号
 * @param userId 用户id
 */
const initPvpUser: GameAPI.InitPvpUser = ({ roomId, userId, canvasWidth, canvasHeight }) => {
    let ret = getGameByRoomId(roomId);
    if (ret.errMsg) {
        send(ws, GameAPI.ApiResType.ERROR, ret);
        return;
    }
    let gameItem: Game.GameItem = ret.data;
    let userConfig = gameItem.users[userId] && gameItem.users[userId].userConfig;
    if (!userConfig) {
        send(ws, GameAPI.ApiResType.ERROR, gameResult('该用户未上传个人配置', null));
        return;
    }
    snakeStore.generateSnakeByUser(roomId, userId, userConfig, canvasWidth, canvasHeight);
    for (let i = 0; i < 30; i++) {
        generateBean(roomId, canvasWidth, canvasHeight);
    }
    show(roomId);
};

/**
 * 处理移动
 * todo 1. 游戏结束后将蛇转换为豆子
 * todo 2. 保存记录，删除一系列缓存， 退出房间
 * @param payload 参数载荷
 */
const handleMove: GameAPI.HandleMove = (payload) => {
    snakeStore.move(payload);
    let isGameOver = snakeStore.validGameOver(payload);
    if (isGameOver) {
        send(ws, GameAPI.ApiResType.GAME_OVER, gameResult());
    } else {
        show(payload.roomId);
    }
};

const pvpCtrl = (wsEl: Ws) => {
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
            case 'init':
                initPvpUser(payload.data);
                break;
            case 'move':
                handleMove(payload.data);
                break;
            case 'direction':
                let { roomId, userId, keyCode } = payload.data;
                snakeStore.changeDirection(roomId, userId, keyCode);
                break;
        }
    };
};

export default pvpCtrl;
