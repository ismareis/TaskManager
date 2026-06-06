const UserRepository = require('../../database/repositories/UserRepository');
const JwtService = require('../../services/JwtService');

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: 'User not logged in'
        });
    }

    const [, token] = authHeader.split(' ');

    try {
        const payload = JwtService.verifyToken(token);

        const user = await UserRepository.findById(payload.id);

        if (user.tokenVersion !== payload.tokenVersion) {
            return res.status(401).json({
                message: 'Token revoked'
            });
        }

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