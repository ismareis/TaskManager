const JwtService = require('../services/JwtService');

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: 'Token not provided'
        });
    }

    const [, token] = authHeader.split(' ');

    try {
        const payload = JwtService.verifyToken(token);

        req.user = payload;

        next();
    }
    catch {
        return res.status(401).json({
            message: 'Invalid token'
        });
    }
}

module.exports = authMiddleware;