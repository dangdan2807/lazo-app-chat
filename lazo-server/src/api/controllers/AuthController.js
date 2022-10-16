const authService = require('../services/AuthService');

class AuthController {
    // [POST] /auth/login
    login = async (req, res, next) => {
        const { username, password } = req.body;
        const source = req.headers['user-agent'];

        try {
            const { token, refreshToken } = await authService.login(username, password, source);
            res.json({ token, refreshToken });
        } catch (err) {
            next(err);
        }
    }

    // [POST] /auth/registry
    registry = async (req, res, next) => {
        try {
            await authService.registry(req.body);

            res.status(201).json({
                success: true,
                message: 'Đăng ký tài khoản thành công'
            });
        } catch (err) {
            next(err);
        }
    }

    // [POST] /auth/confirm-account
    async confirmAccount(req, res, next) {
        const { username, otp } = req.body;

        try {
            await authService.confirmAccount(username, otp + '');

            res.status(200).json({
                success: true,
                message: 'Xác nhận tài khoản thành công'
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AuthController();
