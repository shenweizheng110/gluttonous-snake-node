import * as express from 'express';
import GS from 'GS';
import * as joi from 'joi';
import { formatError } from '../common/util';
import {
    createRoom,
    getRoomList,
    delRoomById,
    getAllRoomCover,
    getRoomPassword
} from '../services/roomService';

const router = express.Router();

// 创建一个房间
router.post('/create', async (req: express.Request, res: GS.CustomResponse) => {
    const { error, value } = joi.validate(req.body, {
        roomName: joi.string().required(),
        ownerId: joi.number().required(),
        roomPassword: joi.string(),
        initSpeed: joi.number(),
        miniSpeed: joi.number(),
        maxSpeed: joi.number()
    });
    if (error) {
        res.sendPre(1001, formatError(error));
        return;
    }
    let roomCoverRet = await getAllRoomCover();
    // console.log(roomCoverRet);
    let roomCoverList = roomCoverRet.data;
    let randomCoverIndex = Math.floor(Math.random() * roomCoverList.length);
    // console.log(roomCoverList);
    if (roomCoverList.length === 0 || !roomCoverList[randomCoverIndex].url) {
        value.roomCover = 'http://qiniu.shenweini.cn/snake1.jpeg';
    } else {
        value.roomCover = roomCoverList[randomCoverIndex].url;
    }
    value.createTime = new Date();
    value.updateTime = new Date();
    res.sendPre(await createRoom(value));
});

// 分页获取房间列表
router.get('/list', async (req: express.Request, res: GS.CustomResponse) => {
    const { error, value } = joi.validate(req.query, {
        t: joi.date(),
        page: joi.number().min(1).required(),
        pageSize: joi.number().min(1).required(),
        roomName: joi.string().allow('', null),
        ownerName: joi.string().allow('', null),
        roomId: joi.number().allow('', null),
        miniSpeed: joi.number().min(1).allow('', null),
        maxSpeed: joi.number().max(20).allow('', null)
    });
    if (error) {
        res.sendPre(1001, formatError(error));
        return;
    }
    value.pageStart = (value.page - 1) * value.pageSize;
    res.sendPre(await getRoomList(value));
});

// 删除房间
router.delete('/del/:roomId', async (req: express.Request, res: GS.CustomResponse) => {
    const { error, value } = joi.validate(req.params, {
        roomId: joi.number().required()
    });
    if (error) {
        res.sendPre(1001, formatError(error));
        return;
    }
    let result = await delRoomById(parseInt(value.roomId));
    res.sendPre(result);
});

router.post('/enter', async (req: express.Request, res: GS.CustomResponse) => {
    const { error, value } = joi.validate(req.body, {
        roomId: joi.string().required(),
        password: joi.string().required()
    });
    if (error) {
        res.sendPre(1001, formatError(error));
        return;
    }
    let result: any = await getRoomPassword(value.roomId);
    if (result.data.roomPassword !== value.password) {
        res.sendPre(2008, null);
        return;
    }
    res.sendPre(null);
});

export default router;
