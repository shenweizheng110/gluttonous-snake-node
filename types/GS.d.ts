import * as express from 'express';

// gluttonous-snake
declare namespace GS {
    // router 注册
    type RegisterRouterFnc = (appInfo: any) => void;

    // 返回码枚举
    interface Code {
        [key: number]: string;
    }

    // done 返回值
    interface DoneReturn<T> {
        error: null;
        data: T;
    }

    // fail 返回值
    interface FailRetuen<E, T> {
        error: E;
        data: T;
    }

    // ? 无法覆盖第三方的生命文件
    // 自定义 response 方法
    interface CustomResponse extends express.Response {
        sendPre: (...args: any) => void;
    }

    // 必填参数校验函数
    type ValidRequiredParamsFnc = (params: object, requiredKeys?: string[]) => string | null;

    // 分页信息入参
    interface PageInfoParams {
        page: number;
        pageSize: number;
        pageStart: number;
    }

    // 分页信息
    interface PageInfoRes {
        page: number;
        pageSize: number;
        total: number;
    }

    // total信息
    type TotalRes = [{ total: number }]

    // 返回结果
    interface GameResult {
        errMsg: string | null;
        data: any;
    }
}

export default GS;
