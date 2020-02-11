import { getAllBeans, destory } from './beanStore';
import Snake from 'Snake';
import gameConfig from './gameConfig';
import { Direction, RotateOffset } from './../../types/Enum';
import { isBallCrash } from '../common/util';
import { generateBean } from './beanStore';
import { changeScore, recordGameByUser, addDefeat } from './gameStore';

let snakeLinkUser: Snake.SnakeLinkUser = {};

// let snakes: Snake.Snakes = {};

let snakeNodes: Snake.SnakeNodes = {};

let snakeId = 0;

// 方向偏移量
const DIRECTION_OFFSET: Snake.DirectionOffset = {
    'Top': [0, -1],
    'Bottom': [0, 1],
    'Left': [-1, 0],
    'Right': [1, 0]
};

// 反方向偏移量
const DIRECTION_OPPOSITE_OFFSET: Snake.DirectionOffset = {
    'Top': [0, 1],
    'Bottom': [0, -1],
    'Left': [1, 0],
    'Right': [-1, 0]
};

// 相对的方向
const RelativeDirection = {
    Top: Direction.Bottom,
    Bottom: Direction.Top,
    Left: Direction.Right,
    Right: Direction.Left
};

const SnakeBase: Snake.SnakeBase = {
    userId: null,
    roomId: null,
    speed: 2,
    energy: 0,
    energyNum: 0,
    snakeHeadId: null,
    snakeCount: 1,
    rotateOffset: null,
    direction: null,
    userConfig: null,
    recordNumber: null,

    /**
     * 为用户生成蛇
     * @param roomId 房间号
     * @param userId 用户id
     * @param userConfig 用户配置
     */
    generateSnakeByUser: (roomId, userId, userConfig) => {
        let currentSnake = snakeLinkUser[roomId] && snakeLinkUser[roomId][userId];
        let canvasWidth = gameConfig.canvasWidth;
        let canvasHeight = gameConfig.canvasHeight;
        if (currentSnake) {
            return;
        }
        let snake: Snake.SnakeBase = Object.create(SnakeBase);
        snake.saveSnakeInfo(roomId, userId, userConfig);
        let snakeHead: Snake.SnakeNode = Object.create(snake);
        let randomX = Math.floor(Math.random() * (canvasWidth - 12 * gameConfig.snakeHeadSize) + 12 * gameConfig.snakeHeadSize);
        let randomY = Math.floor(Math.random() * (canvasHeight - 12 * gameConfig.snakeHeadSize) + 12 * gameConfig.snakeHeadSize);
        snakeHead.initNode(randomX, randomY, true, ++snakeId);
        snake.snakeHeadId = snakeHead.id;
        // snake.recordSnake();
        snakeLinkUser[roomId] = snakeLinkUser[roomId] || {};
        snakeLinkUser[roomId][userId] = snake;
        for (let i = 0; i < 5; i++) {
            snake.appendToTail();
        }
    },

    /**
     * 整合用户的信息
     * @param userId 用户Id
     */
    saveSnakeInfo: function (roomId, userId, userConfig) {
        if (userId === null || userId === undefined) {
            throw Error('userId 不为空');
        }
        this.roomId = roomId;
        this.userId = userId;
        // this.speed = userConfig.initSpeed;
        this.direction = userConfig.initDirection;
        this.rotateOffset = RotateOffset[userConfig.initDirection];
        this.userConfig = userConfig;
    },

    /**
     * 初始化一个蛇节点
     * @param x 横坐标
     * @param y 纵坐标
     * @param isHead 是否是头节点
     * @param id 节点id
     */
    initNode: function (x, y, isHead, id) {
        let { colors } = this.userConfig;
        let { snakeCount } = this;
        this.x = x;
        this.y = y;
        this.isHead = isHead;
        this.color = isHead ? colors[0] : colors[(snakeCount % (colors.length - 1))];
        this.rotateOffset = isHead ? this.rotateOffset : null;
        this.radiusSize = isHead ? gameConfig.snakeHeadSize : gameConfig.snakeBodySize;
        this.preId = null;
        this.nextId = null;
        this.id = id + '';
        this.routes = [];
        this.recordSnakeBody();
    },

    /**
     * 记录蛇
     */
    recordSnake: function () {
        /* snakes[this.roomId] = snakes[this.roomId] || [];
        snakes[this.roomId].push(this);
        this.recordNumber = snakes[this.roomId].length - 1; */
    },

    /**
     * 注册蛇身节点
     */
    recordSnakeBody: function () {
        snakeNodes[this.roomId] = snakeNodes[this.roomId] || {};
        snakeNodes[this.roomId][this.id] = this;
    },

    /**
     * 生成新的节点
     * 新节点的方向：
     * 1. 当前只有一个节点时，跟随当前移动方向
     * 2. 多个节点时，跟随最后两个节点的方向 tailPre tail 两个节点的坐标进行计算，得到相对方向 relaticePosition
     */
    appendToTail: function () {
        let nextTail: Snake.SnakeNode = Object.create(this);
        nextTail.initNode(0, 0, false, `${this.snakeHeadId}.${this.snakeCount++}`);
        let currentRoomSnakeNodes = snakeNodes[this.roomId];
        if (!currentRoomSnakeNodes) {
            throw Error('failed to get snakeNodes by roomId, error in call appendToTail');
        }
        let head = currentRoomSnakeNodes[this.snakeHeadId];
        let tail = head.preId ? currentRoomSnakeNodes[head.preId] : head;
        // 相对方向 - 根据最后两个节点的移动方向计算得到
        let relativeDirection: Direction = null;
        // 1. 只有一个蛇头没有蛇身
        if (head.preId) {
            // 2. 多个节点，根据最后两个节点的位置计算相对方向
            // 计算相对方向
            let tailPre = currentRoomSnakeNodes[tail.preId];
            if (tailPre.x === tail.x && tailPre.y < tail.y) {
                relativeDirection = Direction.Top;
            } else if (tailPre.x === tail.x && tailPre.y > tail.y) {
                relativeDirection = Direction.Bottom;
            } else if (tailPre.y === tail.y && tailPre.x < tail.x) {
                relativeDirection = Direction.Left;
            } else if (tailPre.y === tail.y && tailPre.x > tail.x) {
                relativeDirection = Direction.Right;
            }
        }
        // 最终的方向
        let lastDirection: Direction = relativeDirection || this.direction;
        let offset = DIRECTION_OPPOSITE_OFFSET[lastDirection];
        if (
            tail.x + offset[0] * gameConfig.snakeItemInterval === head.x &&
            tail.y + offset[1] * gameConfig.snakeItemInterval === head.y
        ) {
            lastDirection = this.direction;
            offset = DIRECTION_OPPOSITE_OFFSET[lastDirection];
        }
        nextTail.x = tail.x + offset[0] * gameConfig.snakeItemInterval;
        nextTail.y = tail.y + offset[1] * gameConfig.snakeItemInterval;
        // 链表连接
        // 双向链表
        nextTail.preId = tail.id;
        // nextTail.nextId = this.snakeHeadId;
        tail.nextId = nextTail.id;
        currentRoomSnakeNodes[this.snakeHeadId].preId = nextTail.id;
        // 补齐路径数组
        let tmpX = nextTail.x;
        let tmpY = nextTail.y;
        offset = DIRECTION_OFFSET[lastDirection];
        while (tmpX !== tail.x || tmpY !== tail.y) {
            tmpX += offset[0];
            tmpY += offset[1];
            nextTail.routes.push([tmpX, tmpY]);
        }
        nextTail.routes.push([tmpX, tmpY]);
    },

    /**
     * 处理蛇移动
     * @param payload 参数载荷
     */
    move: function (roomId) {
        let currentRoomSnakeNodes = snakeNodes[roomId];
        for (let id in currentRoomSnakeNodes) {
            if (!/^\d+(\.\d+)?$/.test(id)) {
                return;
            }
            let snakeNode = currentRoomSnakeNodes[id];
            // 蛇头填补路径数组
            if (snakeNode.isHead) {
                let offset = DIRECTION_OFFSET[snakeNode.direction];
                for (let i = 1; i <= snakeNode.speed; i++) {
                    snakeNode.routes.push([snakeNode.x + offset[0] * i, snakeNode.y + offset[1] * i]);
                }
            }
            let nextRoute = snakeNode.routes[snakeNode.speed - 1];
            snakeNode.x = nextRoute[0];
            snakeNode.y = nextRoute[1];
            let nextNodeRoute = snakeNode.routes.splice(0, snakeNode.speed);
            if (snakeNode.nextId) {
                currentRoomSnakeNodes[snakeNode.nextId].routes.push(...nextNodeRoute);
            }
        }
    },

    validEatOrGameOver: async function(roomId) {
        let currentRoomSnakeNodes = snakeNodes[roomId];
        let currentRoomSnakes = SnakeBase.getSnakes(roomId);
        let gameOverUserIds: string[] = [];
        currentRoomSnakes.forEach(async (snake) => {
            let snakeHeadNode = currentRoomSnakeNodes[snake.snakeHeadId];
            snakeHeadNode.validCanEat(snake.roomId);
            let isGameOver = snakeHeadNode.validDefeated();
            if (!isGameOver) {
                isGameOver = snakeHeadNode.validGameOver();
            }
            if (isGameOver) {
                gameOverUserIds.push(snakeHeadNode.userId);
                await recordGameByUser(snakeHeadNode.roomId, snakeHeadNode.userId);
            }
        });
        // 对 snakeNodes遍历 存在且userId 不一样 被击杀
        // 坐标
        return gameOverUserIds;
    },

    validDefeated: function() {
        let currentRoomSnakeNodes = snakeNodes[this.roomId];
        let isDefeated = false;
        Object.keys(currentRoomSnakeNodes).some(key => {
            let snakeNode = currentRoomSnakeNodes[key];
            if (snakeNode.userId === this.userId) {
                return false;
            }
            if (
                Math.abs(snakeNode.x - this.x) <= snakeNode.radiusSize + this.radiusSize &&
                Math.abs(snakeNode.y - this.y) <= snakeNode.radiusSize + this.radiusSize
            ) {
                isDefeated = true;
                addDefeat(this.roomId, snakeNode.userId);
                this.destoryToBean();
                return true;
            }
        });
        return isDefeated;
    },

    /**
     * 校验有没有豆子可以吃
     * @param paylaod 参数载荷
     */
    validCanEat: function (roomId) {
        let beanStore = getAllBeans(roomId);
        Object.keys(beanStore).forEach(key => {
            let bean = beanStore[key];
            if (isBallCrash(this.x, this.y, this.radiusSize, bean.x, bean.y, bean.val)) {
                this.eat(bean);
            }
        });
    },

    /**
     * 吃豆子
     * @param bean 被吃的豆子
     * @param payload 其他参数载荷
     */
    eat: function(bean) {
        this.energy += bean.val;
        this.energyNum += bean.val;
        changeScore(this.roomId, this.userId, this.energyNum);
        if (this.energy > gameConfig.snakeEnergy) {
            this.energy = 0;
            this.appendToTail();
        }
        destory(this.roomId, gameConfig.canvasWidth, gameConfig.canvasHeight, bean);
    },

    /**
     * 蛇头转向
     * @param roomId 房间号
     * @param userId 用户id
     * @param keyCode 键位
     */
    changeDirection: (roomId, userId, keyCode) => {
        let snake = snakeLinkUser[roomId][userId];
        if (!snake) {
            throw Error('failed to get snake, error in change direction');
        }
        let speedUp = snake.userConfig.speedUp;
        if (speedUp == keyCode + '') {
            snake.speed = 5;
            return;
        }
        let directionCode: Snake.KeyCodeConfig = snake.userConfig.directionCode;
        if (!directionCode[keyCode]) {
            return;
        }
        let nextDirection = directionCode[keyCode];
        // 相对方向检测
        if (snake.direction === nextDirection || snake.direction === RelativeDirection[nextDirection]) {
            return;
        }
        snake.direction = nextDirection;
        // 修正选装偏移量 - 修正眼睛的位置
        snakeNodes[roomId][snake.snakeHeadId].rotateOffset = RotateOffset[snake.direction];
    },

    // 还原速度
    destorySpeedUp: (roomId, userId, keyCode) => {
        let snake = snakeLinkUser[roomId][userId];
        if (!snake) {
            throw Error('failed to get snake, error in change direction');
        }
        let speedUp = snake.userConfig.speedUp;
        if (speedUp == keyCode + '') {
            snake.speed = 2;
            return;
        }
    },

    /**
     * 根据 roomId 获取对应房间的蛇及节点的信息
     * @param roomId 房间号
     */
    getSnakeByRoomId: roomId => {
        return {
            snakeNodes: snakeNodes[roomId],
            snakes: SnakeBase.getSnakes(roomId)
        };
    },

    /**
     * 将蛇变为豆子
     */
    destoryToBean: function() {
        let { roomId, userId } = this;
        let maxWidth = gameConfig.canvasWidth;
        let maxHeight = gameConfig.canvasHeight;
        let currentRoomSnakes = snakeLinkUser[roomId];
        let currentRoomSnakeNodes = snakeNodes[roomId];
        if (!currentRoomSnakes) {
            throw Error('当前对局不存在');
        }
        let snake = currentRoomSnakes[userId];
        if (!snake) {
            throw Error('该用户的蛇不存在');
        }
        let currentNode = currentRoomSnakeNodes[snake.snakeHeadId];
        while (currentNode) {
            if (!currentNode) {
                break;
            }
            let randomX = currentNode.x + Math.floor(Math.random() * -10 + 5);
            let randomY = currentNode.y + Math.floor(Math.random() * -10 + 5);
            generateBean(roomId, maxWidth, maxHeight, randomX, randomY);
            delete currentRoomSnakeNodes[currentNode.id];
            currentNode = currentRoomSnakeNodes[currentNode.nextId];
        }
        // snakes[roomId].splice(snake.recordNumber, 1);
        delete snakeLinkUser[roomId][userId];
    },

    /**
     * 校验是否是撞到墙壁或者撞到蛇身
     * todo 判断是否撞到其他的蛇身
     * 1. 判断是不是用一个snakeHeadId 该值在节点的原型链中
     * 2. 判断是否相撞
     * @param roomId 房间号
     * @param userId 用户id
     * @param maxWidth 最大宽度
     * @param maxHeight 最大高度
     */
    validGameOver: function() {
        let { x, y, radiusSize } = this;
        let { canvasWidth, canvasHeight } = gameConfig;
        if (x - radiusSize <= 0 || x + radiusSize >= canvasWidth || y - radiusSize <= 0 || y + radiusSize >= canvasHeight) {
            this.destoryToBean();
            return true;
        }
        return false;
    },

    /**
     * 校验是否对局结束
     */
    validIsAllOver: (roomId) => {
        return SnakeBase.getSnakes(roomId).length === 0;
    },

    /**
     * 判断当前用户的蛇是否存在 防止用户刷新
     */
    validUserExist: (roomId, userId) => {
        return !!(snakeLinkUser[roomId] && snakeLinkUser[roomId][userId]);
    },

    // 获取当前房间内所有的蛇
    getSnakes: (roomId) => {
        return Object.keys(snakeLinkUser[roomId]).map(userId => snakeLinkUser[roomId][userId]);
    }
};

export default SnakeBase;
