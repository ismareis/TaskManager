const UpdateUserUseCase = require('@src/application/use-cases/users/UpdateUserUseCase');
const UserRepository = require('@src/infra/database/repositories/UserRepository');
const PasswordHasher = require('@src/infra/services/PasswordHasher');
const AccessLevel = require('@src/domain/enums/AccessLevel');
const NotFoundError = require('@src/domain/errors/NotFoundError');
const ValidationError = require('@src/domain/errors/ValidationError');
const ForbiddenError = require('@src/domain/errors/ForbiddenError');
const ConflictError = require('@src/domain/errors/ConflictError');

jest.mock('@src/infra/database/repositories/UserRepository');
jest.mock('@src/infra/services/PasswordHasher');

function buildUser(overrides = {}) {
    return {
        id: 1,
        username: 'johndoe',
        name: 'John Doe',
        password: 'hashed_password',
        role: 'employee',
        accessLevel: AccessLevel.USER,
        validate: jest.fn().mockReturnValue({
            isValid: true,
            errors: []
        }),
        ...overrides,
    };
}

describe('UpdateUserUseCase', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('payload validation', () => {
        it('should return ValidationError when id is invalid', async () => {
            const authenticatedUser = { id: 1, accessLevel: AccessLevel.USER };

            await expect(
                UpdateUserUseCase.execute(authenticatedUser, null, { name: 'New name' })
            ).rejects.toThrow(ValidationError);

            expect(UserRepository.findById).not.toHaveBeenCalled();
        });

        it('should return ValidationError when data is empty', async () => {
            const authenticatedUser = { id: 1, accessLevel: AccessLevel.USER };

            await expect(
                UpdateUserUseCase.execute(authenticatedUser, 1, {})
            ).rejects.toThrow(ValidationError);

            expect(UserRepository.findById).not.toHaveBeenCalled();
        });
    });

    describe('user validation', () => {
        it('should return NotFoundError when user doesnt exist', async () => {
            UserRepository.findById.mockResolvedValue(null);

            const authenticatedUser = { id: 1, accessLevel: AccessLevel.USER };

            await expect(
                UpdateUserUseCase.execute(authenticatedUser, 1, { name: 'New name' })
            ).rejects.toThrow(NotFoundError);

            expect(UserRepository.findById).toHaveBeenCalledWith(1);
            expect(UserRepository.update).not.toHaveBeenCalled();
        });

        it('should return ForbiddenError when user is not owner or admin', async () => {
            const user = buildUser({ id: 99 });
            UserRepository.findById.mockResolvedValue(user);

            const authenticatedUser = { id: 1, accessLevel: AccessLevel.USER };

            await expect(
                UpdateUserUseCase.execute(authenticatedUser, user.id, { name: 'New name' })
            ).rejects.toThrow(ForbiddenError);

            expect(UserRepository.update).not.toHaveBeenCalled();
        });

        it('should return ConflictError when username already exists for another user', async () => {
            const user = buildUser({ id: 1 });
            UserRepository.findById.mockResolvedValue(user);
            UserRepository.findByUsername.mockResolvedValue({ id: 99 });

            const authenticatedUser = { id: 1, accessLevel: AccessLevel.USER };

            await expect(
                UpdateUserUseCase.execute(authenticatedUser, user.id, { username: 'newusername' })
            ).rejects.toThrow(ConflictError);

            expect(UserRepository.findByUsername).toHaveBeenCalledWith('newusername');
            expect(UserRepository.update).not.toHaveBeenCalled();
        });

        it('should not return ConflictError when username belongs to same user', async () => {
            const user = buildUser({ id: 1, username: 'johndoe' });
            UserRepository.findById.mockResolvedValue(user);
            UserRepository.findByUsername.mockResolvedValue({ id: 1 });
            UserRepository.update.mockImplementation(async (updatedUser) => updatedUser);

            const authenticatedUser = { id: 1, accessLevel: AccessLevel.USER };

            const result = await UpdateUserUseCase.execute(authenticatedUser, user.id, {
                username: 'johndoe'
            });

            expect(UserRepository.update).toHaveBeenCalledWith(user);
            expect(result.username).toBe('johndoe');
        });

        it('should return ValidationError when user entity validation fails', async () => {
            const user = buildUser({
                validate: jest.fn().mockReturnValue({
                    isValid: false,
                    errors: ['Invalid user']
                })
            });

            UserRepository.findById.mockResolvedValue(user);

            const authenticatedUser = { id: 1, accessLevel: AccessLevel.USER };

            await expect(
                UpdateUserUseCase.execute(authenticatedUser, user.id, { name: '' })
            ).rejects.toThrow(ValidationError);

            expect(UserRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('user update', () => {
        it('should update user when authenticated user is owner', async () => {
            const user = buildUser({ id: 1 });

            UserRepository.findById.mockResolvedValue(user);
            UserRepository.findByUsername.mockResolvedValue(null);
            PasswordHasher.hash.mockResolvedValue('new_hashed_password');
            UserRepository.update.mockImplementation(async (updatedUser) => updatedUser);

            const authenticatedUser = { id: 1, accessLevel: AccessLevel.USER };

            const result = await UpdateUserUseCase.execute(authenticatedUser, user.id, {
                username: 'newusername',
                name: 'New Name',
                role: 'manager',
                password: 'newpassword'
            });

            expect(PasswordHasher.hash).toHaveBeenCalledWith('newpassword');

            expect(UserRepository.update).toHaveBeenCalledWith(expect.objectContaining({
                username: 'newusername',
                name: 'New Name',
                role: 'manager',
                password: 'new_hashed_password'
            }));

            expect(result).toEqual({
                id: user.id,
                username: 'newusername',
                name: 'New Name',
                role: 'manager',
                accessLevel: AccessLevel.toPresentation(user.accessLevel)
            });
        });

        it('should update user when authenticated user is admin', async () => {
            const user = buildUser({ id: 99 });

            UserRepository.findById.mockResolvedValue(user);
            UserRepository.update.mockImplementation(async (updatedUser) => updatedUser);

            const authenticatedUser = { id: 1, accessLevel: AccessLevel.ADMIN };

            const result = await UpdateUserUseCase.execute(authenticatedUser, user.id, {
                name: 'Admin Updated User'
            });

            expect(UserRepository.update).toHaveBeenCalledWith(expect.objectContaining({
                id: user.id,
                name: 'Admin Updated User'
            }));

            expect(result.name).toBe('Admin Updated User');
        });

        it('should not hash password when password is not informed', async () => {
            const user = buildUser({ id: 1 });

            UserRepository.findById.mockResolvedValue(user);
            UserRepository.update.mockImplementation(async (updatedUser) => updatedUser);

            const authenticatedUser = { id: 1, accessLevel: AccessLevel.USER };

            await UpdateUserUseCase.execute(authenticatedUser, user.id, {
                name: 'New Name'
            });

            expect(PasswordHasher.hash).not.toHaveBeenCalled();
        });
    });
});