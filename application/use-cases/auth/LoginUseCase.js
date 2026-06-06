const UserRepository = require('../../../infra/database/repositories/UserRepository');
const PasswordHasher = require('../../../infra/services/PasswordHasher');
const JwtService = require('../../../infra/services/JwtService');

class LoginUseCase {
    async execute(username, password) {
        const user = await UserRepository.findByUsername(username);

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const passwordMatches =
            await PasswordHasher.compare(password, user.password);

        if (!passwordMatches) {
            throw new Error('Invalid credentials');
        }

        return JwtService.generateToken(user);
    }
}

module.exports = new LoginUseCase();