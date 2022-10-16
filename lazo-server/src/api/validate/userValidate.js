const MyError = require('../exception/MyError');

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
}

module.exports = new userValidate();
