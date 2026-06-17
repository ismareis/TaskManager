const UserRepository = require('../../../infra/database/repositories/UserRepository');
const PasswordHasher = require('../../../infra/services/PasswordHasher');
const JwtService = require('../../../infra/services/JwtService');
const UnauthorizedError = require('../../../domain/errors/UnauthorizedError');
const ValidationError = require('../../../domain/errors/ValidationError');

class LoginUseCase {
    static async execute(username, password) {
        if(!username){
            throw new ValidationError("Username is required");
        }

        if(!password){
            throw new ValidationError("Password is required");
        }

        const user = await UserRepository.findByUsername(username);

        if (!user) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const passwordMatches = await PasswordHasher.compare(password, user.password);

        if (!passwordMatches) {
            throw new UnauthorizedError('Invalid credentials');
        }

        user.tokenVersion += 1;
        await UserRepository.update(user);

        return JwtService.generateToken(user);
    }
}

module.exports = LoginUseCase;