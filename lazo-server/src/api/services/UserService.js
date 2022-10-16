const User = require('../models/User');

const NotFoundError = require('../exception/NotFoundError');

class UserService {
    getUserSummaryInfo = async (username) => {
        const user = await User.findOne({ username }, '-_id username name avatar isActived');

        if (!user) {
            throw new NotFoundError('User');
        }

        return user;
    }
}

module.exports = new UserService();
