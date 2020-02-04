import * as express from 'express';
import GS from 'GS';
import * as joi from 'joi';
import { formatError } from '../common/util';
import {
    getSettingsByUserId,
    updateUserConfig,
    initUserConfig
} from '../services/settingsService';

const router = express.Router();

// 根据userId 获取用户配置
router.get('/getUser/:userId', async (req: express.Request, res: GS.CustomResponse) => {
    const { error, value } = joi.validate(req.params, {
        userId: joi.string().required()
    });
    if (error) {
        res.sendPre(1001, formatError(error));
        return;
    }
    let userConfig = await getSettingsByUserId(value.userId);
    res.sendPre(userConfig);
});

/**
 * 更新用户配置
 */
router.post('/updateUser', async (req: express.Request, res: GS.CustomResponse) => {
    const { error, value } = joi.validate(req.body, {
        userId: joi.string().required(),
        userConfig: joi.object()
    });
    if (error) {
        res.sendPre(1001, formatError(error));
        return;
    }
    let ret = await updateUserConfig(value.userId, value.userConfig);
    res.sendPre(ret);
});

/**
 * 初始化用户配置
 */
router.get('/init/:userId', async (req: express.Request, res: GS.CustomResponse) => {
    const { error, value } = joi.validate(req.params, {
        userId: joi.string().required()
    });
    if (error) {
        res.sendPre(1001, formatError(error));
        return;
    }
    let ret = await initUserConfig(value.userId);
    res.sendPre(ret);
});

export default router;
