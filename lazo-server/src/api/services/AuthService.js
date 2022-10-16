const User = require('../models/User');

const classifyService = require('../services/ClassifyService');

const userValidate = require('../validate/userValidate');

const tokenUtils = require('../../utils/tokenUtils');
const commonUtils = require('../../utils/commonUtils');
const mailer = require('../../utils/mailer');
const templateHtml = require('../../utils/templateHtml');

const axios = require('axios');

const OTP_EXPIRE_MINUTE = parseInt(process.env.OTP_EXPIRE_MINUTE);


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

    registry = async (userInfo) => {
        const registryInfo = await userValidate.checkRegistryInfo(userInfo);

        const avatarColor = await classifyService.getRandomColor();
        const newUser = new User({
            ...registryInfo,
            avatarColor,
            isActived: false,
        });
        const saveUser = await newUser.save();

        const { _id, username } = saveUser;
        this.sendOTP(_id, username);
    };

    sendOTP = async (_id, username) => {
        // email: true
        let type = true;

        if (userValidate.validatePhone(username)) {
            type = false;
        }

        const otp = commonUtils.getRandomOTP();
        const otpTime = new Date();
        otpTime.setMinutes(otpTime.getMinutes() + OTP_EXPIRE_MINUTE);
        await User.updateOne({ _id }, { otp, otpTime });
        if (type)
            mailer.sendMail(
                username,
                'Lazo - OTP xác nhận tài khoản',
                templateHtml.getOtpHtml(otp, OTP_EXPIRE_MINUTE),
            );
        else {
            const { data } = await axios.post(process.env.BALANCE_API_URL, {
                ApiKey: process.env.PHONE_API_KEY,
                SecretKey: process.env.PHONE_API_SECRET,
            });

            if (data.Balance > 500) {
                await axios.get(process.env.PHONE_OTP_API_URL, {
                    params: {
                        Phone: username,
                        Content: `Lazo - Ma OTP (thoi han ${OTP_EXPIRE_MINUTE} phut) xac nhan tai khoan  la: ${otp} `,
                        ApiKey: process.env.PHONE_API_KEY,
                        SecretKey: process.env.PHONE_API_SECRET,
                        SmsType: 8,
                    },
                });
            } else throw new MyError('Insufficient money ');
        }
    };
}

module.exports = new AuthService();
