import { Direction, RotateOffset } from './Enum';
import GS from 'GS';

declare namespace Snake {
    // 移动方向
    /* const enum Direction {
        Top = 'Top',
        Bottom = 'Bottom',
        Left = 'Left',
        Right = 'Right'
    } */

    // 旋转偏移量
    /* enum RotateOffset {
        Top = 0,
        Bottom = 180,
        Left = 270,
        Right = 90
    } */

    // 相对的方向
/*     enum RelativeDirection {
        Top = 'Bottom',
        Bottom = 'Top',
        Left = 'Right',
        Right = 'Left',
    } */

    // 方向偏移量
    interface DirectionOffset {
        'Top': [number, number];
        'Bottom': [number, number];
        'Left': [number, number];
        'Right': [number, number];
    }

    // 路径
    type RouteItem = [number, number]

    // 蛇
    interface Snake {
        userId: string;
        roomId: string;
        speed: number;
        energyNum: number;
        energy: number;
        direction: Direction;
        snakeHeadId: string;
        snakeCount: number;
        rotateOffset: RotateOffset;
        userConfig: UserConfig;
    }
    // 蛇节点
    interface SnakeNode extends SnakeBase {
        x: number;
        y: number;
        isHead: boolean;
        color: string;
        rotateOffset: number;
        radiusSize: number;
        preId: string;
        nextId: string;
        id: string;
        routes: RouteItem[];
    }
    // 蛇 用户相关
    type SnakeLinkUser = {
        [roomId: string]: {
            [userId: string]: Snake;
        };
    }

    type Snakes = {
        [roomId: string]: Snake[];
    }

    type SnakeNodes = {
        [roomId: string]: {
            [ket: string]: SnakeNode;
        };
    }

    // 生成一个 snakeNode 蛇节点
    type GenerateSnakeNode = (roomId: string, userId: string) => void

    // 为用户生成一条蛇
    type GenerateSnakeByUser = (roomId: string, userId: string) => GS.GameResult

    // 键位配置
    interface KeyCodeConfig {
        [key: string]: Direction;
    }

    // 用户配置
    interface UserConfig {
        userId: string;
        colors: string[];
        initDirection: Direction;
        up: Direction;
        down: Direction;
        left: Direction;
        right: Direction;
        directionCode: KeyCodeConfig;
        speedUp: Direction;
        initSpeed: Direction;
        dangerColor: string;
        eyeColor: string;
    }

    // 无参数无返回值函数
    type VoidFnc = () => void;

    // 前后台传递参数
    interface ShowPayload {
        roomId: string;
        userId: string;
        maxWidth: number;
        maxHeight: number;
    }

    interface SnakeBase {
        userId: string;
        roomId: string;
        speed: number;
        energyNum: number;
        energy: number;
        direction: Direction;
        snakeHeadId: string;
        snakeCount: number;
        rotateOffset: RotateOffset;
        userConfig: UserConfig;

        generateSnakeByUser: (roomId: string, userId: string, userConfig: UserConfig, canvasWidth: number, canvasHeight: number) => void;

        saveSnakeInfo: (roomId: string, userId: string, userConfig: UserConfig) => void;

        initNode: (x: number, y: number, isHead: boolean, id: number | string) => void;

        recordSnake: VoidFnc;

        appendToTail: VoidFnc;

        recordSnakeBody: VoidFnc;

        move: (payload: ShowPayload) => void;

        validCanEat: (payload: ShowPayload) => void;

        eat: (bean: any, payload: ShowPayload) => void;

        changeDirection: (roomId: string, userId: string, keyCode: number) => void;

        getSnakeByRoomId: (roomId: string) => {
            snakes: Snake[];
            snakeNodes: {
                [key: string]: SnakeNode;
            };
        };

        validGameOver: (payload: ShowPayload) => boolean;
    }
}

export default Snake;
