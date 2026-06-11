const UserRepository = require('../../database/repositories/UserRepository');
const JwtService = require('../../services/JwtService');
const UnauthorizedError = require('../../../domain/errors/UnauthorizedError');

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next(new UnauthorizedError('User not logged in'));
    }

    const [, token] = authHeader.split(' ');

    try {
        const payload = JwtService.verifyToken(token);

        const user = await UserRepository.findById(payload.id);

        if (!user || user.tokenVersion !== payload.tokenVersion) {
            return next(new UnauthorizedError('Token revoked'));
        }

        req.user = payload;

        next();
    }
    catch (error) {
        return next(new UnauthorizedError('Invalid token'));
    }
}

module.exports = authMiddleware;