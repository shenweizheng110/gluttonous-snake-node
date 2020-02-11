import * as express from 'express';
import GS from 'GS';
import * as joi from 'joi';
import { formatError } from '../common/util';
import {
    getScoreRank,
    getDefeatCountRank,
    getRecordCountRank,
    getMaxDefeatRank
} from '../services/rankService';

const router = express.Router();

router.get('/', async (req: express.Request, res: GS.CustomResponse) => {
    const { error, value } = joi.validate(req.query, {
        page: joi.number().min(1).required(),
        pageSize: joi.number().min(1).required(),
        userId: joi.string().required(),
        type: joi.string().equal('score', 'defeatCount', 'recordCount', 'maxDefeat'),
        t: joi.date()
    });
    if (error) {
        res.sendPre(1001, formatError(error));
        return;
    }
    value.pageStart = (value.page - 1) * value.pageSize;
    switch (value.type) {
        case 'score':
            res.sendPre(await getScoreRank(value));
            break;
        case 'defeatCount':
            res.sendPre(await getDefeatCountRank(value));
            break;
        case 'recordCount':
            res.sendPre(await getRecordCountRank(value));
            break;
        case 'maxDefeat':
            res.sendPre(await getMaxDefeatRank(value));
            break;
    }
});

export default router;
