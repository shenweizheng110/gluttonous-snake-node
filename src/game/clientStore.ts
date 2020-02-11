import GameAPI from 'GameAPI';

// 所有的连接
let clients = new Set();

// game 相关连接
let gameClients: GameAPI.GameClient = {};

// 多人对战相关连接
let pvpClients: GameAPI.GameClient = {};

/**
 * 添加连接
 * @param ws websocket连接
 */
export const addClient: GameAPI.AddClient = (ws) => {
    clients.add(ws);
};

/**
 * websocket 断开连接时移除该连接
 * @param ws websocket连接
 */
export const removeClient: GameAPI.RemoveClient = (ws) => {
    clients.delete(ws);
};

/**
 * 验证 webwocket 连接是否打开状态
 * @param ws websocket连接
 */
export const validWsIsOpen: GameAPI.ValidWsIsOpen = (ws) => {
    return clients.has(ws);
};

/**
 * 保存用户的 ws 连接
 * @param roomId 房间号
 * @param userId 用户id
 * @param ws websocket连接
 */
export const addPartClient: GameAPI.AddPartClient = (clientType, roomId, userId, ws) => {
    let targetClient = clientType === 'game' ? gameClients : pvpClients;
    targetClient[roomId] = targetClient[roomId] || {};
    targetClient[roomId][userId] = ws;
};

/**
 * 移除ws连接
 * @param roomId 房间号
 * @param userId 用户id， 有用户id 就删除用户连接 没有就删除房间所有连接
 */
export const removePartClient: GameAPI.RemovePartClient = (clientType, roomId, userId) => {
    let targetClient = clientType === 'game' ? gameClients : pvpClients;
    if (userId !== null || userId !== undefined) {
        delete targetClient[roomId][userId];
        return;
    }
    delete targetClient[roomId];
};

/**
 * 游戏广播
 * @param roomId 房间号
 * @param type 返回数据 type
 * @param data 返回数据
 */
export const partClientBroadcast: GameAPI.PartClientBroadcast = (clientType, roomId, type, data) => {
    let targetClient = clientType === 'game' ? gameClients : pvpClients;
    let roomClient = targetClient[roomId];
    if (!roomClient) {
        throw Error('房间已失效');
    }
    Object.keys(roomClient).forEach(userId => {
        let userClient = roomClient[userId];
        if (clients.has(userClient)) {
            roomClient[userId].send(JSON.stringify({
                type,
                data
            }));
        } else {
            removeClient(userClient);
        }
    });
};
