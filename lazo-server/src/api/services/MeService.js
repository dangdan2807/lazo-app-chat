const MyError = require('../exception/MyError');

const User = require('../models/User');

const userValidate = require('../validate/userValidate');

class MeService {
    getProfile = async (_id) => {
        const user = await User.getById(_id);

        return user;
    };

    updateProfile = async (_id, profile) => {
        if (!profile) {
            throw new MyError('Profile invalid');
        }

        const profileWasValidate = userValidate.checkProfile(profile);

        // check user
        await User.getById(_id);

        await User.updateOne({ _id }, { ...profileWasValidate });
    };
}

module.exports = new MeService();
