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
    updateFavour,
    register,
    getUserByParams,
    resetPassword,
    getUserScoreAndSettings,
    updateMaxScore
} from '../services/userService';
import client from '../common/redisStore';

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
        favour: joi.number(),
        signature: joi.string(),
        headImg: joi.string().uri()
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
    const { error, value } = joi.validate(req.body, {
        userId: joi.string().required(),
        favourId: joi.string().required(),
        recordId: joi.string().allow('', null)
    });
    if (error) {
        res.sendPre(1001, formatError(error));
        return;
    }
    const { favourId, recordId, userId } = value;
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
            userId: userId,
            favourUserId: favourIdInt,
            createTime: new Date()
        });
        res.sendPre(ret);
    };
});

// 用户注册
router.post('/register', async (req: express.Request, res: GS.CustomResponse) => {
    const { error, value } = joi.validate(req.body, {
        username: joi.string().required(),
        phone: joi.string().required(),
        code: joi.string().required(),
        password: joi.string().required(),
        email: joi.string().required(),
        age: joi.string().required(),
        gender: joi.string().required().allow('male', 'female'),
        signature: joi.string().required(),
        headImg: joi.string().required(),
        hash: joi.string().required().allow('', null)
    });
    if (error) {
        res.sendPre(1001, formatError(error));
        return;
    }
    client.getAsync(`${value.hash}_code`)
        .then(async (code: string) => {
            if (code !== value.code) {
                res.sendPre(2003, null);
                return;
            }
            delete value.code;
            delete value.hash;
            let existUser = await getUserByParams({ phone: value.phone });
            if (existUser.data.length !== 0) {
                res.sendPre(2004, null);
                return;
            }
            existUser = await getUserByParams({ email: value.email });
            if (existUser.data.length !== 0) {
                res.sendPre(2005, null);
                return;
            }
            existUser = await getUserByParams({ username: value.username });
            if (existUser.data.length !== 0) {
                res.sendPre(2007, null);
                return;
            }
            res.sendPre(await register(value));
        })
        .catch((error: any) => {
            console.log(error);
            res.sendPre(0, error);
        });
});

// 修改手机号
router.put('/update/phone', async (req: express.Request, res: GS.CustomResponse) => {
    const { error, value } = joi.validate(req.body, {
        userId: joi.number().required(),
        password: joi.string().required(),
        phone: joi.string().regex(phone),
        code: joi.string().required(),
        hash: joi.string().required().allow('', null)
    });
    if (error) {
        res.sendPre(1001, formatError(error));
        return;
    }
    let ret = await getUserByParams({ userId: value.userId });
    let existUser = ret.data[0];
    if (existUser.password !== value.password) {
        res.sendPre(2008, null);
        return;
    }
    client.getAsync(`${value.hash}_code`)
        .then(async (code: string) => {
            if (code !== value.code) {
                res.sendPre(2003, null);
                return;
            }
            value.id = value.userId;
            value.updateTime = new Date();
            delete value.code;
            delete value.password;
            delete value.hash;
            delete value.userId;
            let ret = await updateUser(value);
            res.sendPre(ret);
        })
        .catch((error: any) => {
            console.log(error);
            res.sendPre(0, error);
        });
});

// 修改密码
router.put('/update/password', async (req: express.Request, res: GS.CustomResponse) => {
    const { error, value } = joi.validate(req.body, {
        userId: joi.number().required(),
        oldPassword: joi.string().required(),
        newPassword: joi.string().required()
    });
    if (error) {
        res.sendPre(1001, formatError(error));
        return;
    }
    let ret = await getUserByParams({ userId: value.userId });
    let existUser = ret.data[0];
    if (existUser.password !== value.oldPassword) {
        res.sendPre(2008, null);
        return;
    }
    value.id = value.userId;
    value.updateTime = new Date();
    value.password = value.newPassword;
    delete value.oldPassword;
    delete value.newPassword;
    delete value.userId;
    res.sendPre(await updateUser(value));
});

// 重置密码
router.post('/reset/password', async (req: express.Request, res: GS.CustomResponse) => {
    const { error, value } = joi.validate(req.body, {
        phone: joi.string().required().regex(phone),
        password: joi.string().required(),
        hash: joi.string().required(),
        code: joi.string().required()
    });
    if (error) {
        res.sendPre(1001, formatError(error));
        return;
    }
    client.getAsync(`${value.hash}_code`)
        .then(async (code: string) => {
            if (code !== value.code) {
                res.sendPre(2003, null);
                return;
            }
            delete value.hash;
            delete value.code;
            res.sendPre(await resetPassword(value));
        })
        .catch((error: any) => {
            console.log(error);
            res.sendPre(0, error);
        });
});

router.get('/scoreAndSettings', async (req: express.Request, res: GS.CustomResponse) => {
    const { error, value } = joi.validate(req.query, {
        userId: joi.number().required(),
        t: joi.date()
    });
    if (error) {
        res.sendPre(1001, formatError(error));
        return;
    }
    let ret = await getUserScoreAndSettings(value.userId);
    res.sendPre(ret);
});

router.post('/update/score', async (req: express.Request, res: GS.CustomResponse) => {
    const { error, value } = joi.validate(req.body, {
        userId: joi.number().required(),
        maxScore: joi.string().required()
    });
    if (error) {
        res.sendPre(1001, formatError(error));
        return;
    }
    let ret = await updateMaxScore(value);
    res.sendPre(ret);
});

export default router;
