import GS from 'GS';

declare namespace User {
    // 获取房间列表函数
    // type GetRoomList = (roomInfo: SearchInfo) => Promise<GS.DoneReturn<GetRoomListRes> | GS.FailRetuen<string, null>>

    // 用户登陆传递参数
    interface LoginParam {
        username?: string;
        phone?: string;
        email?: string;
    }

    // 登陆返回参数
    interface LoginRes {
        userId: number;
        password: string;
        username: string;
        headImg: string;
    }

    // 用户性别
    enum Sex {
        male,
        female
    }

    // 用户字段
    interface UserInfo {
        userId: number;
        username?: string;
        phone?: string;
        email?: string;
        age?: number;
        gender?: Sex;
        province?: string;
        city?: string;
        detailAddress?: string;
        favour?: number;
        signature?: string;
        headImg?: string;
        updateTime?: Date;
    }

    interface UserFavourRecord {
        userId: number;
        favourUserId: number;
        createTime: Date;
    }

    // 获取用户密码
    type GetPasswordByParams = (loginInfo: LoginParam) => Promise<GS.DoneReturn<LoginRes[]> | GS.FailRetuen<string, null>>

    // 更新用户信息
    type UpdateUserByParams = (userInfo: UserInfo) => Promise<GS.DoneReturn<any> | GS.FailRetuen<string, null>>

    // 获取用户基础信息
    type GetBaseInfo = (userId: number) => Promise<GS.DoneReturn<UserInfo> | GS.FailRetuen<string, null>>

    // 处理点赞
    type UpdateFavour = (favourUserId: number, favourCount: number) => Promise<GS.DoneReturn<any> | GS.FailRetuen<string, null>>;

    // 删除点赞记录
    type DelFavourRecord = (recordId: number) => Promise<GS.DoneReturn<any> | GS.FailRetuen<string, null>>;

    // 添加点赞记录
    type AddFavourRecord = (recordInfo: UserFavourRecord) => Promise<GS.DoneReturn<number> | GS.FailRetuen<string, null>>;
}

export default User;

