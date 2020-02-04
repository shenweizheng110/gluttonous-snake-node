import * as result from '../common/result';
import * as express from 'express';
import GS from 'GS';

const sendHelper = (req: express.Request, res: GS.CustomResponse, next: express.NextFunction) => {
    res.sendPre = (...args: any[]) => {
        if (args.length === 0) {
            res.send(result.success());
        } else if (args.length === 1) {
            res.send(result.success(args[0]));
        } else if (args.length === 2) {
            res.send(result.error(args[0], args[1]));
        } else {
            throw new Error('The params of function res.send is unnormal!');
        }
    };
    // ? 无法覆盖第三方的生命文件
    /* let send = res.send;
    res.send = function(...args: any[]) {
        if (args.length === 0) {
            send.call(Object.assign(res, {
                send: send
            }), result.success());
        } else if (args.length === 1) {
            send.call(Object.assign(res, {
                send: send
            }), result.success(args[0]));
        } else if (args.length === 2) {
            send.call(Object.assign(res, {
                send: send
            }), result.error(args[0], args[1]));
        } else {
            throw new Error('The params of function ctx.send is unnormal!');
        }
        return res;
    }; */
    next();
};

export default sendHelper;
