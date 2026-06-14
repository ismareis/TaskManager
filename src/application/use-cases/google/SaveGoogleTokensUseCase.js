const UserRepository = require('../../../infra/database/repositories/UserRepository');

const NotFoundError = require('../../../domain/errors/NotFoundError');
const ValidationError = require('../../../domain/errors/ValidationError');

class SaveGoogleTokensUseCase {
    static async execute({ userId, tokens }) {
        const user = await UserRepository.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        if (!tokens.access_token) {
            throw new ValidationError('Google Access Token not received');
        }

        await UserRepository.updateGoogleTokens(userId, {
            googleAccessToken: tokens.access_token,
            googleRefreshToken: tokens.refresh_token,
            googleTokenExpiry: new Date(tokens.expiry_date),
        });
    }
}

module.exports = SaveGoogleTokensUseCase;