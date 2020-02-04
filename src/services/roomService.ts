import dao from '../dao';
import Room from 'Room';
import GS from 'GS';
import { done, fail } from '../common/util';

/**
 * 创建房间
 * @param roomInfo 房间信息
 */
export const createRoom: Room.CreateRoom = async (roomInfo) => {
    let { insertId } = await dao.insert('room', roomInfo);
    if (insertId) {
        return done<number>(insertId);
    } else {
        return fail<string>('创建房间失败', null);
    }
};

/**
 * 分页获取房间列表
 * @param searchInfo{Room.SearchInfo} 筛选信息
 * @param pageInfo{GS.PageInfo} 分页信息
 */
export const getRoomList: Room.GetRoomList = async (roomInfo: Room.SearchInfo) => {
    let roomList: Room.RoomListItem[] = await dao.query('room.getRoomList', roomInfo);
    let totalRes: GS.TotalRes = await dao.query('common.getTableTotal', { tableName: 'room' });
    let res: Room.GetRoomListRes = {
        roomList,
        pageInfo: {
            page: roomInfo.page,
            pageSize: roomInfo.pageSize,
            total: totalRes[0].total
        }
    };
    return done<Room.GetRoomListRes>(res);
};

/**
 * 删除房间
 * @param roomId 房间id
 */
export const delRoomById: Room.DelRoom = async (roomId: number) => {
    let ret: any = await dao.update('room', {
        id: roomId,
        isDelete: 1,
        updateTime: new Date()
    });
    return done<any>(ret[0]);
};

/**
 * 获取所有的房间封面
 */
export const getAllRoomCover: Room.VoidFnc = async () => {
    let roomCoverList: Room.RoomCoverItem[] = await dao.query('common.getAllRoomCover');
    return done<Room.RoomCoverItem[]>(roomCoverList);
};
