const CreateUserUseCase = require('@src/application/use-cases/users/CreateUserUseCase');
const UserRepository = require('@src/infra/database/repositories/UserRepository');
const PasswordHasher = require('@src/infra/services/PasswordHasher');
const AccessLevel = require('@src/domain/enums/AccessLevel');
const ValidationError = require('@src/domain/errors/ValidationError');
const ConflictError = require('@src/domain/errors/ConflictError');

jest.mock('@src/infra/database/repositories/UserRepository');
jest.mock('@src/infra/services/PasswordHasher');

function buildValidData(overrides = {}) {
    return {
        name: 'John Doe',
        username: 'johndoe',
        password: '123456',
        role: 'employee',
        ...overrides,
    };
}

describe('CreateUserUseCase', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('payload validation', () => {
        it('should return ValidationError when data is undefined', async () => {
            await expect(CreateUserUseCase.execute(undefined)).rejects.toThrow(ValidationError);

            expect(UserRepository.findByUsername).not.toHaveBeenCalled();
            expect(UserRepository.create).not.toHaveBeenCalled();
        });

        it('should return ValidationError when data is null', async () => {
            await expect(CreateUserUseCase.execute(null)).rejects.toThrow(ValidationError);
        });

        it('should return ValidationError when data is empty object', async () => {
            await expect(CreateUserUseCase.execute({})).rejects.toThrow(ValidationError);
        });
    });

    describe('username validation', () => {
        it('should return ConflictError when username already exists', async () => {
            UserRepository.findByUsername.mockResolvedValue({ id: 1 });

            await expect(CreateUserUseCase.execute(buildValidData())).rejects.toThrow(ConflictError);

            expect(UserRepository.findByUsername).toHaveBeenCalledWith('johndoe');
            expect(PasswordHasher.hash).not.toHaveBeenCalled();
            expect(UserRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('user validation', () => {
        it('should return ValidationError when user entity validation fails', async () => {
            UserRepository.findByUsername.mockResolvedValue(null);

            const data = buildValidData({ username: '' });

            await expect(CreateUserUseCase.execute(data)).rejects.toThrow(ValidationError);

            expect(PasswordHasher.hash).not.toHaveBeenCalled();
            expect(UserRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('user creation', () => {
        it('should create user with hashed password and default access level', async () => {
            const createdUser = {
                id: 1,
                name: 'John Doe',
                username: 'johndoe',
                role: 'employee',
                accessLevel: AccessLevel.USER
            };

            UserRepository.findByUsername.mockResolvedValue(null);
            PasswordHasher.hash.mockResolvedValue('hashed_password');
            UserRepository.create.mockResolvedValue(createdUser);

            const result = await CreateUserUseCase.execute(buildValidData());

            expect(PasswordHasher.hash).toHaveBeenCalledWith('123456');

            expect(UserRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                name: 'John Doe',
                username: 'johndoe',
                password: 'hashed_password',
                role: 'employee',
                accessLevel: AccessLevel.USER,
                disabled: false
            }));

            expect(result).toBe(createdUser);
        });
    });
});