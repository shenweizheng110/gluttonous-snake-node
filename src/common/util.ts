import GS from 'GS';
import GameAPI from 'GameAPI';
import { validWsIsOpen } from '../game/clientStore';

function done<T = null>(data: T = null): GS.DoneReturn<T> {
    return {
        error: null,
        data
    };
}

function fail<E, T = null>(error: E, data: T = null): GS.FailRetuen<E, T> {
    return {
        error,
        data
    };
}

// 校验必填参数
const validRequiredParams: GS.ValidRequiredParamsFnc = (params, requiredKeys = []) => {
    if (typeof params !== 'object') {
        return `need valid object 'params' is not object`;
    }
    if (!params) {
        return `need valid object 'params' is not exist`;
    }
    let errMsg: string | null = null;
    requiredKeys.some(key => {
        if (!Object.hasOwnProperty.call(params, key)) {
            errMsg = `${key} 参数缺失`;
            return true;
        }
    });
    return errMsg;
};

// 转换 joi的 参数验证错误
const formatError = (errors: any) => {
    let array = [];
    for (let item of errors.details) {
        array.push({
            message: item.message,
            path: item.path[0]
        });
    }
    return array;
};

// 转换 ws 接口 joi错误
const formatErrorBaseWs = (errors: any) => {
    let msg = '';
    for (let item of errors.details) {
        msg = item.message + '；';
    }
    return msg;
};

/**
 * websocket 发送函数
 * @param type 返回类型 error | success
 * @param payload 参数
 */
const send: GameAPI.Send = (ws, type, payload) => {
    if (validWsIsOpen(ws)) {
        ws.send(JSON.stringify({
            type,
            data: payload
        }));
    }
};

/**
 * 计算两点之间的距离
 * @param {number} x1 第 1 个点的 x
 * @param {number} y1 第 1 个点的 y
 * @param {number} x2 第 2 个点的 x
 * @param {number} y2 第 2 个点的 y
 * @returns {number}
 */
const calDistance = (x1: number, y1: number, x2: number, y2: number) => Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

/**
 * 碰撞检测 - 球
 * @param {*} x1 第 1 个点的 x
 * @param {*} y1 第 1 个点的 y
 * @param {*} r1 第 1 个球的 半径
 * @param {*} x2 第 2 个点的 x
 * @param {*} y2 第 2 个点的 y
 * @param {*} r2 第 2 个球的 半径
 * @returns {boolean}
 */
const isBallCrash = (x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) => {
    let distance = calDistance(x1, y1, x2, y2);
    return distance < r1 + r2;
};

export {
    done,
    fail,
    validRequiredParams,
    formatError,
    formatErrorBaseWs,
    send,
    calDistance,
    isBallCrash
};
