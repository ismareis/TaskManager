const UserRepository = require('../../../infra/database/repositories/UserRepository');
const NotFoundError = require('../../../domain/errors/NotFoundError');
const ValidationError = require('../../../domain/errors/ValidationError');

class GetUserUseCase {
    static async execute(id) {
        if (!id || typeof id !== 'string') {
            throw new ValidationError('Invalid user id');
        }

        const user = await UserRepository.findById(id);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        return {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            disabled: user.disabled,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }
}

module.exports = GetUserUseCase;