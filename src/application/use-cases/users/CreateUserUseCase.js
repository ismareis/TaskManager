const UserRepository = require("@src/infra/database/repositories/UserRepository");
const PasswordHasher = require("@src/infra/services/PasswordHasher");
const User = require("@src/domain/entities/User");
const AccessLevel = require("@src/domain/enums/AccessLevel");
const ValidationError = require("@src/domain/errors/ValidationError");
const ConflictError = require("@src/domain/errors/ConflictError");

class CreateUserUseCase {
    static async execute(data) {
        if (!data || Object.keys(data).length === 0) {
            throw new ValidationError("Request body is required");
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

        const existingUser = await UserRepository.findByUsername(data.username);

        if (existingUser) {
            throw new ConflictError("Username already exists");
        }

        user.password = await PasswordHasher.hash(data.password);

        return await UserRepository.create(user);
    }
}

module.exports = CreateUserUseCase;