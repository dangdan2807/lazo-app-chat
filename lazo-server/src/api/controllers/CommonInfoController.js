const WebInfo = require('../models/WebInfo');
const redisDb = require('../../helpers/redis');

class CommonInfoController {
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
}

module.exports = new CommonInfoController();
