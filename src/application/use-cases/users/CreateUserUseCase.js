const User = require('../../../domain/entities/User');
const AccessLevel = require('../../../domain/enums/AccessLevel');

const UserRepository = require('../../../infra/database/repositories/UserRepository');
const PasswordHasher = require('../../../infra/services/PasswordHasher');

const ValidationError = require('../../../domain/errors/ValidationError');
const ConflictError = require('../../../domain/errors/ConflictError');

class CreateUserUseCase {
    static async execute(data) {
        if (!data || Object.keys(data).length === 0) {
            throw new ValidationError('Request body is required');
        }

        const existingUser = await UserRepository.findByUsername(data.username);

        if (existingUser) {
            throw new ConflictError('Username already exists');
        }

        const user = new User({
            name: data.name,
            username: data.username,
            password: data.password,
            role: data.role,
            accessLevel: AccessLevel.USER,
            disabled: false
        });

        const validation = user.validate();

        if (!validation.isValid) {
            throw new ValidationError(validation.errors);
        }

        user.password = await PasswordHasher.hash(data.password);

        const createdUser = await UserRepository.create(user);

        return createdUser;
    }
}

module.exports = CreateUserUseCase;