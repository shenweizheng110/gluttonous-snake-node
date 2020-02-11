import * as express from 'express';
import * as joi from 'joi';
import GS from 'GS';
import { formatError } from '../common/util';
import codeConfig from '../common/codeConfig';
import client from '../common/redisStore';
import * as qiniu from 'qiniu';
import qiniuConfig from '../common/qiniuConfig';

const QcloudSms = require('qcloudsms_js');

const router = express.Router();

router.get('/code', (req: express.Request, res: GS.CustomResponse) => {
    const { error, value } = joi.validate(req.query, {
        t: joi.date(),
        phone: joi.string().required(),
        hash: joi.string().required().allow('register', 'old', 'new')
    });
    if (error) {
        res.sendPre(1001, formatError(error));
        return;
    }
    let { phone, hash } = value;
    // 实例化
    const qcloudsms = QcloudSms(codeConfig.appid, codeConfig.appkey);
    // 创建单发短信对象
    const ssender = qcloudsms.SmsSingleSender();
    let randomCode = '';
    for (let i = 0; i < 4; i++) {
        randomCode = `${randomCode}${Math.floor(Math.random() * 10)}`;
    }
    const callback = (_err: any, _codeRes: any, resData: any) => {
        res.sendPre(resData);
    };
    client.setAsync(`${hash}_code`, randomCode, 'EX', 5 * 60)
        .then(() => {
            ssender.sendWithParam(
                86,
                phone,
                codeConfig.templateId,
                [randomCode],
                codeConfig.smsSign,
                '',
                '',
                callback
            );
        })
        .catch((_err: any) => {
            res.sendPre(_err);
        });
});

router.post('/upload', (req: any, res: GS.CustomResponse) => {
    const mac = new qiniu.auth.digest.Mac(qiniuConfig.accessKey, qiniuConfig.secretKey);
    const options = {
        scope: qiniuConfig.bucket
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(mac);
    const config: any = new qiniu.conf.Config();
    config.zone = qiniu.zone.Zone_z0;
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();
    let randomCode = '';
    for (let i = 0; i < 10; i++) {
        randomCode = `${randomCode}${Math.floor(Math.random() * 10)}`;
    }
    let { originalFilename, path } = req.files.file;
    originalFilename = originalFilename.replace(/\b(?=\.(jpg|jpeg|png))/g, randomCode);
    formUploader.putFile(uploadToken, originalFilename, path, putExtra, (respErr, respBody, respInfo) => {
        if (respErr) {
            throw respErr;
        }
        if (respInfo.statusCode == 200) {
            res.sendPre(respBody);
        }
    });
});

export default router;
