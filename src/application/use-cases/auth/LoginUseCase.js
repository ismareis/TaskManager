const UserRepository = require('../../../infra/database/repositories/UserRepository');
const PasswordHasher = require('../../../infra/services/PasswordHasher');
const JwtService = require('../../../infra/services/JwtService');
const UnauthorizedError = require('../../../domain/errors/UnauthorizedError');

class LoginUseCase {
    static async execute(username, password) {
        const user = await UserRepository.findByUsername("");

        if (!user) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const passwordMatches =
            await PasswordHasher.compare(password, user.password);

        if (!passwordMatches) {
            throw new UnauthorizedError('Invalid credentials');
        }

        return JwtService.generateToken(user);
    }
}

module.exports = LoginUseCase;