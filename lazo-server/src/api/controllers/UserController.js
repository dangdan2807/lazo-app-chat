const userService = require('../services/UserService');

class UserController {
    // [GET] /users/search/username/:username
    getByUsername = async (req, res, next) => {
        const { _id } = req;
        const { username } = req.params;

        try {
            const user = await userService.getStatusFriendOfUser(_id, username);

            res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    };

    // [GET] /users/search/id/:userId
    getById = async (req, res, next) => {
        const { _id } = req;
        const { userId } = req.params;

        try {
            const user = await userService.getStatusFriendOfUserById(_id, userId);

            res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    };
}

module.exports = new UserController();
