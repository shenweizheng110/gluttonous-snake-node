import ApiResult from 'ApiResult';

/**
 * 返回数据格式
 *
 */
const code = require('./statusCode');

/**
 * 操作成功，只传入返回的结果即可
 */
export const success = (...args: any[]) => {
    let result = null;
    if (args.length == 0) {
        result = {
            status: code(1)
        };
    } else if (args.length == 1) {
        result = {
            status: code(1),
            result: args[0]
        };
    } else if (args.length == 2) {
        result = {
            status: code(args[0]),
            result: args[1]
        };
    }
    return result;
};

/**
 * 出现错误的时候，调用此方法
 */
export const error: ApiResult.ErrorResFnc = (num, result) => {
    return {
        status: code(num),
        result: result
    };
};
