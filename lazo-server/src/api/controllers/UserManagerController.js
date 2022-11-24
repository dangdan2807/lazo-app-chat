const userService = require('../services/UserService');
const MyError = require('../exception/MyError');

class UserManagerController {
    // [GET] /admin/users-manager
    getList = async (req, res, next) => {
        const { username = '', page = 0, size = 20 } = req.query;

        try {
            const users = await userService.getList(
                username,
                parseInt(page),
                parseInt(size),
            );

            res.status(200).json(users);
        } catch (err) {
            next(err);
        }
    };

    // [PATCH] /admin/users-manager/:userId/:isActived
    updateActived = async (req, res, next) => {
        const { _id } = req;
        const { id, isActived } = req.params;

        try {
            if (_id == id) {
                throw new MyError('Not Me');
            }
            if (isActived !== '0' && isActived !== '1') {
                throw new MyError('IsActived invalid');
            }

            const status = isActived === '0' ? false : true;
            await userService.updateActived(id, status);

            res.status(200).json({
                status: 200,
                message: 'Update actived successfully',
            });
        } catch (err) {
            next(err);
        }
    };
}

module.exports = new UserManagerController();
