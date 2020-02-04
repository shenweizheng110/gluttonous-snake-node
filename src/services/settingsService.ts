import { createRoom } from './roomService';
import dao from '../dao';
import Settings from 'Settings';
import { done, fail } from '../common/util';

/**
 * 根据用户 id 获取用户的配置
 * @param userId 用户id
 */
export const getSettingsByUserId: Settings.GetSettingsByUserId = async (userId) => {
    let ret: Settings.GetSettingsRes = await dao.query('settings.getSettingsByUserId', { userId });
    return done<Settings.UserConfig>(ret[0]);
};

/**
 * 初始化用户配置
 * @param userId 用户id
 */
export const initUserConfig: Settings.InitUserConfig = async (userId) => {
    let { insertId } = await dao.insert('settings', {
        userId,
        up: 87,
        down: 83,
        left: 65,
        right: 68,
        start: 32,
        exit: 27,
        speedUp: 75,
        showFight: 1,
        showPersonal: 1,
        initSpeed: 2,
        dangerColor: 'red',
        nodeColor: '#336633;#336666;#336699',
        eyeColor: '#000',
        createTime: new Date(),
        updateTime: new Date()
    });
    return done<number>(insertId);
};

/**
 * 更新用户配置
 * @param userId 用户id
 * @param userConfig 用户配置
 */
export const updateUserConfig: Settings.UpdateUserConfig = async (userId, userConfig) => {
    let ret: any = await dao.update('settings', {
        userId: userId,
        ...userConfig,
        updateTime: new Date()
    }, 'user_id');
    return done<any>(ret[0]);
};
