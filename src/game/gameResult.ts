import Game from 'Game';

/**
 * Game 相关函数的返回值
 * @param args 参数列表
 */
const result: Game.ResultFnc = (...args) => {
    if (args.length === 0) {
        return {
            errMsg: null,
            data: null
        };
    }
    if (args.length === 1) {
        return {
            errMsg: args[0],
            data: null
        };
    }
    if (args.length === 2) {
        return {
            errMsg: args[0],
            data: args[1]
        };
    }
};

export default result;
