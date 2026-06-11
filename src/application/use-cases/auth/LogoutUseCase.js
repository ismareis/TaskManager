const UserRepository = require('../../../infra/database/repositories/UserRepository');
const NotFoundError = require('../../../domain/errors/NotFoundError');

class LogoutUseCase {
    static async execute(id) {
        const user = await UserRepository.findById(id);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        user.tokenVersion += 1;

        await UserRepository.update(user);
    }
}

module.exports = LogoutUseCase;