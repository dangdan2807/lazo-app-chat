const jwt = require('jsonwebtoken');
const MyError = require('../api/exception/MyError');

const tokenUtils = {
    generateToken: async (data, tokenLife) => {
        if (!data) return null;
        return await jwt.sign(
            { ...data, createdAt: new Date() },
            process.env.JWT_KEY,
            {
                expiresIn: tokenLife,
            }
        );
    }
};

module.exports = tokenUtils;