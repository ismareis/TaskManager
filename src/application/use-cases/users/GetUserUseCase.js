const UserRepository = require('../../../infra/database/repositories/UserRepository');
const NotFoundError = require('../../../domain/errors/NotFoundError');
const ValidationError = require('../../../domain/errors/ValidationError');
const AccessLevel = require('../../../domain/enums/AccessLevel');
class GetUserUseCase {
    static async execute(id) {
        if (!id) {
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
            accessLevel: AccessLevel.toPresentation(user.accessLevel)
        };
    }
}

module.exports = GetUserUseCase;