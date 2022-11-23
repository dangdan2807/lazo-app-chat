const authService = require('../services/AuthService');
const userService = require('../services/UserService');

class AuthController {
    // [POST] /auth/login
    login = async (req, res, next) => {
        const { username, password } = req.body;
        const source = req.headers['user-agent'];

        try {
            const { token, refreshToken } = await authService.login(
                username,
                password,
                source,
            );

            res.status(201).json({ status: 201, token, refreshToken });
        } catch (err) {
            next(err);
        }
    };

    // [POST] /auth/refresh-token
    refreshToken = async (req, res, next) => {
        const { refreshToken } = req.body;
        const source = req.headers['user-agent'];

        try {
            const token = await authService.refreshToken(refreshToken, source);

            res.status(200).json({ status: 200, token });
        } catch (err) {
            next(err);
        }
    };

    // [POST] /auth/registry
    registry = async (req, res, next) => {
        try {
            await authService.registry(req.body);

            res.status(201).json({
                status: 201,
                message: 'Registry successfully',
            });
        } catch (err) {
            next(err);
        }
    };

    // [POST] /auth/confirm-account
    confirmAccount = async (req, res, next) => {
        const { username, otp } = req.body;

        try {
            await authService.confirmAccount(username, otp + '');

            res.status(200).json({
                status: 200,
                message: 'Confirm account successfully',
            });
        } catch (err) {
            next(err);
        }
    };

    // [POST] /auth/reset-otp
    resetOTP = async (req, res, next) => {
        const { username } = req.body;
        try {
            const status = await authService.resetOTP(username);

            res.status(201).json(status);
        } catch (err) {
            next(err);
        }
    };

    // [POST] /auth/confirm-password
    confirmPassword = async (req, res, next) => {
        const { username, otp, password } = req.body;

        try {
            await authService.resetPassword(username, otp + '', password);

            res.status(201).json({
                status: 201,
                message: 'Reset password successfully',
            });
        } catch (err) {
            next(err);
        }
    };

    // [GET]  /auth/users/:username
    getUserInfo = async (req, res, next) => {
        const { username } = req.params;

        try {
            const user = await userService.getUserSummaryInfo(username);

            return res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    };
}

module.exports = new AuthController();
