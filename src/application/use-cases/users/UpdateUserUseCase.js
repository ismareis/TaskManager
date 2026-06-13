const UserRepository = require('../../../infra/database/repositories/UserRepository');
const PasswordHasher = require('../../../infra/services/PasswordHasher');
const AccessLevel = require('../../../domain/enums/AcessLevel');

const NotFoundError = require('../../../domain/errors/NotFoundError');
const ValidationError = require('../../../domain/errors/ValidationError');
const ForbiddenError = require('../../../domain/errors/ForbiddenError');
const ConflictError = require('../../../domain/errors/ConflictError');

class UpdateUserUseCase {
    static async execute(authenticatedUser, id, data) {
        if (!id) {
            throw new ValidationError('Invalid user id');
        }

        if (!data || Object.keys(data).length === 0) {
            throw new ValidationError('Request body is required');
        }

        const user = await UserRepository.findById(id);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        const isOwner = authenticatedUser.id === id;
        const isAdmin = authenticatedUser.accessLevel === AccessLevel.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new ForbiddenError('You do not have permission to update this user');
        }

        if (data.username !== undefined) {
            const existingUser = await UserRepository.findByUsername(data.username);

            if (existingUser && existingUser.id !== id) {
                throw new ConflictError('Username already exists');
            }

            user.username = data.username;
        }

        if (data.name !== undefined) {
            user.name = data.name;
        }

        if (data.role !== undefined) {
            user.role = data.role;
        }

        if (data.password !== undefined){
            user.password = await PasswordHasher.hash(data.password);
        }

        const validation = user.validate();

        if (!validation.isValid) {
            throw new ValidationError(validation.errors.join(', '));
        }

        const updatedUser = await UserRepository.update(user);

        return {
            id: updatedUser.id,
            username: updatedUser.username,
            name: updatedUser.name,
            role: updatedUser.role,
            disabled: updatedUser.disabled
        };
    }
}

module.exports = UpdateUserUseCase;