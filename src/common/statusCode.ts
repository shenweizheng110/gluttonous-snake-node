import ApiResult from 'ApiResult';

/**
 *  所有状态码
 *  状态码对应的信息都在这配置
 */
const code: ApiResult.Code = {
    1: '操作成功',
    0: '操作失败',

    // 1xxx 系统级
    1001: '参数有误',
    1002: 'JSON 格式有误',
    1003: '未登录，请先登录',
    1004: '您没有权限进行此项操作，请先核实后再操作！',
    1005: '数据库数据错误',

    // 2xxx 用户相关
    2001: '该账号已经注册，请尝试其他账号',
    2002: '账号不存在',
    2003: '验证码错误',
    2004: '手机号已存在',
    2005: '邮箱已存在',
    2006: '用户名或密码错误',
    2007: '用户名已存在',
    2008: '密码错误',

    // 3xxx 游戏平台相关

    // 5xxx 支付平台相关

    // 6xxx 后台管理相关
    6001: '未查询到相关信息'
};

const result: ApiResult.CodeResultFnc = (num: number) => ({
    code: num,
    message: code[num]
});

module.exports = result;
