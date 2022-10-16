const jwt = require('jsonwebtoken');

class AuthMiddleware {
    verifyToken = (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Không tìm thấy access token',
            });
        }
        try {
            const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            req.userId = decode.userId;
            next();
        } catch (error) {
            console.log(error);
            res.status(403).json({
                success: false,
                message: 'Token không hợp lệ',
            });
        }
    };
}

module.exports = new AuthMiddleware();
