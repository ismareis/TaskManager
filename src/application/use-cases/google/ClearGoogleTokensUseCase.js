const UserRepository = require('../../../infra/database/repositories/UserRepository');

const NotFoundError = require('../../../domain/errors/NotFoundError');
const UnauthorizedError = require('../../../domain/errors/UnauthorizedError');

class ClearGoogleTokensUseCase {
    static async execute(userId) {
        const user = await UserRepository.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        if(!user.isGoogleAuthenticated()){
            throw new UnauthorizedError("User not authenticated");
        }

        await UserRepository.clearGoogleTokens(userId);
    }
}

module.exports = ClearGoogleTokensUseCase;