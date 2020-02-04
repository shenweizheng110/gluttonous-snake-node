import * as express from 'express';
import GS from 'GS';
import * as joi from 'joi';
import { formatError } from '../common/util';
import { phone, email } from '../common/reg';
import {
    login,
    updateUser,
    getBaseInfo,
    delFavourRecord,
    addFavourRecord,
    updateFavour
} from '../services/userService';

const router = express.Router();

// 登陆
router.post('/login', async (req: express.Request, res: GS.CustomResponse) => {
    const { error, value } = joi.validate(req.body, {
        account: joi.string().required(),
        password: joi.string().required()
    });
    if (error) {
        res.sendPre(1001, formatError(error));
        return;
    }
    if (phone.test(value.account)) {
        value.phone = value.account;
    } else if (email.test(value.account)) {
        value.email = value.account;
    } else {
        value.username = value.account;
    }
    let validUserInfo = await login(value);
    if (validUserInfo.data.length === 0) {
        res.sendPre(2002, null);
        return;
    }
    if (validUserInfo.data[0].password !== value.password) {
        res.sendPre(2006, null);
    }
    delete validUserInfo.data[0].password;
    res.sendPre(validUserInfo.data[0]);
});

// 获取个人信息
router.get('/detail/:userId', async (req: express.Request, res: GS.CustomResponse) => {
    const { error, value } = joi.validate(req.params, {
        userId: joi.number().required()
    });
    if (error) {
        res.sendPre(1001, formatError(error));
        return;
    }
    let ret = await getBaseInfo(parseInt(value.userId));
    res.sendPre(ret);
});

// 更新个人信息
router.put('/update', async (req: express.Request, res: GS.CustomResponse) => {
    const { error, value } = joi.validate(req.body, {
        userId: joi.number().required(),
        username: joi.string(),
        phone: joi.string().regex(phone),
        password: joi.string(),
        email: joi.string().email(),
        age: joi.number(),
        gender: joi.string().equal('male', 'female'),
        province: joi.string(),
        city: joi.string(),
        detailAddress: joi.string(),
        favour: joi.number(),
        signature: joi.string(),
        hedaImg: joi.string().uri()
    });
    if (error) {
        res.sendPre(1001, formatError(error));
        return;
    }
    value.id = value.userId;
    value.updateTime = new Date();
    delete value.userId;
    let ret = await updateUser(value);
    res.sendPre(ret);
});

// 用户点赞
router.post('/favour', async (req: express.Request, res: GS.CustomResponse) => {
    let currentUserId = 0;
    const { error, value } = joi.validate(req.body, {
        favourId: joi.string().required(),
        recordId: joi.string()
    });
    if (error) {
        res.sendPre(1001, formatError(error));
        return;
    }
    const { favourId, recordId } = value;
    const favourIdInt = parseInt(favourId);
    const recordInt = parseInt(recordId);
    const favourUserInfo = await getBaseInfo(favourIdInt);
    if (!favourUserInfo.data) {
        res.sendPre(1005, null);
        return;
    }
    let currentFavourCount = favourUserInfo.data.favour;
    if (recordInt) {
        await updateFavour(favourIdInt, --currentFavourCount);
        const ret = await delFavourRecord(recordInt);
        res.sendPre(ret);
    } else {
        await updateFavour(favourIdInt, ++currentFavourCount);
        const ret = await addFavourRecord({
            userId: currentUserId,
            favourUserId: favourIdInt,
            createTime: new Date()
        });
        res.sendPre(ret);
    };
});

export default router;
