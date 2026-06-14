const UserRepository = require('../../../infra/database/repositories/UserRepository');
const AccessLevel = require('../../../domain/enums/AcessLevel');

const NotFoundError = require('../../../domain/errors/NotFoundError');
const ValidationError = require('../../../domain/errors/ValidationError');
const ForbiddenError = require('../../../domain/errors/ForbiddenError');

class DeleteUserUseCase {
    static async execute(authenticatedUser, id) {
        if (!id) {
            throw new ValidationError('Invalid user id');
        }

        const user = await UserRepository.findById(id);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        const isOwner = authenticatedUser.id === user.id;
        const isAdmin = authenticatedUser.accessLevel === AccessLevel.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new ForbiddenError('You do not have permission to delete this user');
        }

        user.disabled = true;

        const validation = user.validate();

        if (!validation.isValid) {
            throw new ValidationError(validation.errors);
        }

        await UserRepository.update(user);
    }
}

module.exports = DeleteUserUseCase;