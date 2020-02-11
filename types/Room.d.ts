import GS from 'GS';

declare namespace Room {
    // 创建房间信息
    interface AddRoomInfo {
        roomName: string;
        ownerId: number;
        roomPassword: string;
        initSpeed: number;
        miniSpeed: number;
        maxSpeed: number;
        peopleCount?: number;
    }

    // 房间筛选信息
    interface SearchInfo extends GS.PageInfoParams {
        roomName?: string;
        roomId?: number;
        ownerName?: string;
        miniSpeed?: number;
        maxSpeed?: number;
    }

    interface RoomListItem {
        roomId: number;
        roomName: string;
        ownerId: number;
        ownerName: string;
        roomPassword: string;
        initSpeed: number;
        miniSpeed: number;
        maxSpeed: number;
        peopleCount: number;
        hasPassword: boolean;
    }

    // 创建房间
    type CreateRoom = (roomInfo: AddRoomInfo) => Promise<GS.DoneReturn<number> | GS.FailRetuen<string, null>>

    // 获取房间列表返回值
    interface GetRoomListRes {
        roomList: RoomListItem[];
        pageInfo: GS.PageInfoRes;
    }

    // 获取房间列表函数
    type GetRoomList = (roomInfo: SearchInfo) => Promise<GS.DoneReturn<GetRoomListRes> | GS.FailRetuen<string, null>>

    // 删除房间
    type DelRoom = (roomId: number) => Promise<GS.DoneReturn<any> | GS.FailRetuen<string, null>>

    // 房间封面
    interface RoomCoverItem {
        id: number;
        url: string;
    }

    // 无参接口
    type VoidFnc = () => Promise<GS.DoneReturn<RoomCoverItem[]> | GS.FailRetuen<string, null>>
}
export default Room;
