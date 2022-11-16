const WebInfo = require('../models/WebInfo');
const redisDb = require('../../helpers/redis');

class CommonInfoController {
    // [Get] /common/web-info
    getWebInfo = async (req, res, next) => {
        try {
            const isExistsCached = await redisDb.exists('web-info');

            let webInfo;
            if (!isExistsCached) {
                webInfo = await WebInfo.find();
                await redisDb.set('web-info', webInfo);
            } else {
                webInfo = await redisDb.get('web-info');
            }
            
            res.status(200).json(webInfo);
        } catch (err) {
            next(err);
        }
    }

    // [GET] /common/google-captcha
    getGoogleCaptcha = async (req, res, next) => {
        res.status(200).json({
            ENABLE_GOOGLE_CAPTCHA: new Boolean(process.env.ENABLE_GOOGLE_CAPTCHA),
            KEY_GOOGLE_CAPTCHA: process.env.KEY_GOOGLE_CAPTCHA,
        });
    }
}

module.exports = new CommonInfoController();
