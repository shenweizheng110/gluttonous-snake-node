import dao from '../dao';
// import GS from 'GS';
import User from 'User';
import { done } from '../common/util';
import { defaultSettings } from '../game/gameConfig';

/**
 * 根据登陆信息获取对应的用户信息
 * @param loginInfo {User.LoginParam} 登陆信息
 */
export const login: User.GetPasswordByParams = async (loginInfo) => {
    let validUserInfo = await dao.query('user.getPasswordByParams', loginInfo);
    return done<User.LoginRes[]>(validUserInfo);
};

export const getUserByParams = async (userInfo: any) => {
    let validUserInfo = await dao.query('user.getPasswordByParams', userInfo);
    return done<User.LoginRes[]>(validUserInfo);
};

/**
 * 更新用户信息
 * @param userInfo 用户信息
 */
export const updateUser: User.UpdateUserByParams = async (userInfo) => {
    let ret = await dao.update('user', userInfo);
    return done<any>(ret[0]);
};

/**
 * 获取用户的基础信息
 * @param userId 用户ID
 */
export const getBaseInfo: User.GetBaseInfo = async (userId) => {
    let ret = await dao.query('user.getBaseInfo', { userId });
    return done<User.UserInfo>(ret[0]);
};

/**
 * 更新用户获赞数
 * @param favourUserId 被点赞的用户id
 * @param favourCount 新的点赞数
 */
export const updateFavour: User.UpdateFavour = async (favourUserId, favourCount) => {
    const ret = await dao.update('user', {
        id: favourUserId,
        favour: favourCount,
        updateTime: new Date()
    });
    return done<any>(ret[0]);
};

/**
 * 删除点赞记录
 * @param recordId 点赞记录id
 */
export const delFavourRecord: User.DelFavourRecord = async (recordId) => {
    const ret = await dao.update('user_favour', {
        id: recordId,
        isDelete: 1,
        updateTime: new Date()
    });
    return done<any>(ret[0]);
};

/**
 * 添加新的点赞记录
 * @param recordInfo 记录信息
 */
export const addFavourRecord: User.AddFavourRecord = async (recordInfo) => {
    const { insertId } = await dao.insert('user_favour', recordInfo);
    return done<number>(insertId);
};

/**
 * 注册新用户
 * @param userInfo 用户信息
 */
export const register: User.RegisterUser = async (userInfo) => {
    let { insertId } = await dao.insert('user', {
        ...userInfo,
        createTime: new Date()
    });
    await dao.insert('settings', {
        userId: insertId,
        ...defaultSettings,
        createTime: new Date()
    });
    return done<number>(insertId);
};

/**
 * 重置密码，手机号作为凭证
 * @param param0
 */
export const resetPassword: User.ResetPassword = async ({ phone ,password }) => {
    let ret = await dao.update('user', {
        phone,
        password
    }, 'phone');
    return done<any>(ret[0]);
};
