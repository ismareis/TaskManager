const UserRepository = require('../../../infra/database/repositories/UserRepository');
const PasswordHasher = require('../../../infra/services/PasswordHasher');

const NotFoundError = require('../../../domain/errors/NotFoundError');
const ValidationError = require('../../../domain/errors/ValidationError');
const ForbiddenError = require('../../../domain/errors/ForbiddenError');
const ConflictError = require('../../../domain/errors/ConflictError');

class UpdateUserUseCase {
    static async execute(authenticatedUser, id, data) {
        if (!id || typeof id !== 'string') {
            throw new ValidationError('Invalid user id');
        }

        if (!data || Object.keys(data).length === 0) {
            throw new ValidationError('Request body is required');
        }

        const user = await UserRepository.findById(id);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        const authenticatedUserId = authenticatedUser.id;
        const authenticatedUserAccessLevel = authenticatedUser.accessLevel;

        const isOwner = authenticatedUserId === id;
        const isAdmin = authenticatedUserAccessLevel === 'admin';

        if (!isOwner && !isAdmin) {
            throw new ForbiddenError('You do not have permission to update this user');
        }

        if (data.username !== undefined) {
            if (!data.username || data.username.trim().length === 0) {
                throw new ValidationError('Username is required');
            }

            const existingUser = await UserRepository.findByUsername(data.username);

            if (existingUser && existingUser.id !== id) {
                throw new ConflictError('Username already exists');
            }

            user.username = data.username;
        }

        if (data.password !== undefined) {
            if (!data.password || data.password.trim().length === 0) {
                throw new ValidationError('Password is required');
            }

            user.password = await PasswordHasher.hash(data.password);
        }

        if (data.name !== undefined) {
            if (!data.name || data.name.trim().length === 0) {
                throw new ValidationError('Name is required');
            }

            user.name = data.name;
        }

        if (data.role !== undefined) {
            if (!data.role || data.role.trim().length === 0) {
                throw new ValidationError('Role is required');
            }

            user.role = data.role;
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