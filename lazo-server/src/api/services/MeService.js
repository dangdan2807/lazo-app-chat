const User = require('../models/User');

class MeService {
    getProfile = async (_id) => {
        const user = await User.getById(_id);

        return user;
    }
}

module.exports = new MeService();
