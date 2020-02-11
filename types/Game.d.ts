import GS from 'GS';
import Snake from 'Snake';

declare namespace Game {
    // 玩家
    interface Gamer {
        userId: string;
        username: string;
        cover: string;
        score: number;
        defeat: number;
        maxScore: number;
        maxDefeat: number;
        enterIndex: number;
        isPrepare: boolean;
        userConfig: Snake.UserConfig;
    }

    // 每一局游戏
    interface GameItem {
        roomId: string;
        hostId: string;
        currentCount: number;
        id: number;
        intervalId: any;
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

    // 分数排行榜
    interface RankItem {
        username: string;
        score: number;
    }

    // 返回结果函数
    type ResultFnc = (...args: any) => GS.GameResult;

    // 基础方法
    type GameCommon = (roomId: string) => GS.GameResult;

    // 用户相关方法
    type GameWithUser = (roomId: string, userId: string) => GS.GameResult

    // 进入房间
    type EnterRoom = (roomId: string, userId: string) => Promise< GS.GameResult>;

    // 开始/结束游戏
    type StartOrEnd = (roomId: string, userId: string) => Promise<GS.GameResult>;

    // 获取所有的游戏
    type GetAllGames = () => GS.GameResult;

    // 更新分数
    type ChangeScore = (roomId: string, userId: string, score: number) => void;

    // 分数排行榜
    type GetScoreRank = (roomId: string) => RankItem[]

    // 离开房间
    type LeaveRoom = (roomId: string, userId: string) => GS.GameResult;

    // 游戏结束后需要更新记录的数据
    interface NeedUpdateRankItem {
        userId: string;
        maxScore: number;
        maxDefeat: number;
    }

    // 游戏记录
    interface RecordItem {
        recordId: number;
        userId: string;
        score: number;
        defeat: number;
        createTime: Date;
        updateTime: Date;
    }

    // 记录用户游戏数据
    type RecordGameByUser = (roomId: string, userId: string) => void;

    // 添加击杀数
    type AddDefeat = (roomId: string, userId: string) => void;
}

export default Game;
