declare namespace ApiResult {
    // 返回码枚举
    interface Code {
        [key: number]: string;
    }

    // Code Result
    interface CodeResult {
        code: number;
        message: string;
    }

    // Code Result Fnc
    type CodeResultFnc = (num: number) => CodeResult;

    // HTTP请求的返回值
    interface Result {
        status: number;
        result: any;
    }

    // HTTP请求错误结果
    type ErrorResFnc = (num: number, result: any) => Result;
}

export default ApiResult;
