const authService = require('../services/AuthService');

class AuthController {
    // [POST] /auth/login
    async login(req, res, next) {
        const { username, password } = req.body;
        const source = req.headers['user-agent'];

        try {
            const { token, refreshToken } = await authService.login(username, password, source);
            res.json({ token, refreshToken });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AuthController();
