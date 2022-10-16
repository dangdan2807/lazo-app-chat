const User = require('../models/User');

const userValidate = require('../validate/userValidate');

const tokenUtils = require('../../utils/tokenUtils');

class AuthService {
    login = async (username, password, source) => {
        userValidate.validateLogin(username, password);
        const { _id } = await User.findByCredentials(username, password);

        return await this.generateAndUpdateAccessTokenAndRefreshToken(_id, source);
    };

    generateAndUpdateAccessTokenAndRefreshToken = async (_id, source) => {
        const token = await tokenUtils.generateToken(
            { _id, source },
            process.env.JWT_LIFE_ACCESS_TOKEN,
        );
        const refreshToken = await tokenUtils.generateToken(
            { _id, source },
            process.env.JWT_LIFE_REFRESH_TOKEN,
        );

        await User.updateOne({ _id }, { $pull: { refreshTokens: { source } } });
        await User.updateOne(
            { _id },
            { $push: { refreshTokens: { token: refreshToken, source } } },
        );

        return {
            token,
            refreshToken,
        };
    };
}

module.exports = new AuthService();
