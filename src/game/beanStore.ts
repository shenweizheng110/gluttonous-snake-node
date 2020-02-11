import Bean from 'Bean';
import gameConfig from './gameConfig';

let beanStore: Bean.BeanStore = {};

/**
 * 初始化一个豆子
 * @param x 横坐标
 * @param y 纵坐标
 * @param val 能量值
 */
const initBean: Bean.IntBean = (x, y, val) => ({
    x,
    y,
    val,
    color: gameConfig.beanColor[Math.floor(Math.random() * gameConfig.beanColor.length)]
});

/**
 * 生成一个豆子
 * @param roomId 房间号
 * @param canvasWidth 最大距离
 * @param canvasHeight 最大高度
 */
export const generateBean: Bean.GenerateBean = (roomId, canvasWidth, canvasHeight, neededX, neededY) => {
    let x = neededX || Math.floor(Math.random() * canvasWidth);
    let y = neededY || Math.floor(Math.random() * canvasHeight);
    let val = Math.ceil((Math.random() + 2) * 3);
    let bean = initBean(x, y, val);
    beanStore[roomId] = beanStore[roomId] || {};
    beanStore[roomId][`${x}-${y}`] = bean;
};

/**
 * 销毁豆子
 * @param roomId 房间号
 * @param canvasWidth 画布宽度
 * @param canvasHeight 画布高度
 * @param beanItem 豆子
 */
export const destory: Bean.Destory = (roomId, canvasWidth, canvasHeight, beanItem) => {
    delete beanStore[roomId][`${beanItem.x}-${beanItem.y}`];
    generateBean(roomId, canvasWidth, canvasHeight);
};

/**
 * 获取对局内所有的豆子
 * @param roomId 房间号
 */
export const getAllBeans: Bean.GetAllBeans = (roomId: string) => {
    return beanStore[roomId];
};

/**
 * 清空房间内的豆子
 * @param roomId 房间号
 */
export const clearBeansByRoomId: Bean.ClearBeansByRoomId = (roomId: string) => {
    delete beanStore[roomId];
};
