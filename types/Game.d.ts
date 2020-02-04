import GS from 'GS';
import Snake from 'Snake';

declare namespace Game {
    // 玩家个人信息
    interface UserInfo {
        username: string;
        headImage: string;
    }

    // 玩家
    interface Gamer {
        userId: string;
        score: number;
        enterIndex: number;
        isPrepare: boolean;
        userConfig: Snake.UserConfig;
        userInfo: UserInfo;
    }
    // 每一局游戏
    interface GameItem {
        roomId: string;
        hostId: string;
        currentCount: number;
        users: {
            [key: string]: Gamer;
        };
        isStart: boolean;
        isEnd: boolean;
    }
    // Game store
    interface GameStore {
        [key: string]: GameItem;
    }

    // 返回结果函数
    type ResultFnc = (...args: any) => GS.GameResult;

    // 基础方法
    type GameCommon = (roomId: string) => GS.GameResult;

    // 用户相关方法
    type GameWithUser = (roomId: string, userId: string) => GS.GameResult

    // 进入房间
    type EnterRoom = (roomId: string, userId: string, userConfig: Snake.UserConfig, userInfo: UserInfo) => GS.GameResult;

    // 获取所有的游戏
    type GetAllGames = () => GS.GameResult;
}

export default Game;
