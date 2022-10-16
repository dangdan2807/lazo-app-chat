const commonUtils = require('../../utils/commonUtils');

const MyError = require('../exception/MyError');

const User = require('../models/User');

const NAME_INVALID = 'Tên không hợp lệ';
const USERNAME_INVALID = 'Tài khoản không hợp lệ';
const USERNAME_EXISTS_INVALID = 'Tài khoản đã tồn tại';
const PASSWORD_INVALID = 'Mật khẩu không hợp lệ, từ 8 đến 50 kí tự';

class userValidate {
    validateLogin = (username, password) => {
        if (!this.validateUsername(username) || !this.validatePassword(password)) {
            throw new MyError('Info login invalid');
        }
    };
    validateUsername = (username) => {
        if (!username || (!this.validateEmail(username) && !this.validatePhone(username))) {
            return false;
        }

        return true;
    };
    validateEmail = (email) => {
        if (!email) return false;

        const regex =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(String(email).toLowerCase());
    };
    validatePhone = (phone) => {
        if (!phone) return false;
        const regex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;

        return regex.test(phone);
    };
    validatePassword = (password) => {
        if (!password) {
            return false;
        }
        if (password.length < 8 || password.length > 50) {
            return false;
        }

        return true;
    };
    checkRegistryInfo = async (userInfo) => {
        const { name, username, password } = userInfo;
        const error = {};

        if (!name || !NAME_REGEX.test(name)) {
            error.name = NAME_INVALID;
        }

        if (!this.validateUsername(username)) {
            error.username = USERNAME_INVALID;
        } else if (await User.findOne({ username })) {
            error.username = USERNAME_EXISTS_INVALID;
        }

        if (!this.validatePassword(password)) {
            error.password = PASSWORD_INVALID;
        }

        // nếu như có lỗi
        if (!commonUtils.isEmpty(error)) {
            throw new MyError(error);
        }

        return { name, username, password };
    };
}

module.exports = new userValidate();
