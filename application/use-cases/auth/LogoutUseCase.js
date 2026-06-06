const UserRepository = require('../../../infra/database/repositories/UserRepository');

class LogoutUseCase {
    static async execute(id) {
        const user = await UserRepository.findById(id);

        if (!user) {
            throw new Error('User not found');
        }

        user.tokenVersion += 1;

        await UserRepository.update(user);
    }
}

module.exports = LogoutUseCase;