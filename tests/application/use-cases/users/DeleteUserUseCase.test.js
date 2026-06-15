const DeleteUserUseCase = require('@src/application/use-cases/users/DeleteUserUseCase');
const UserRepository = require('@src/infra/database/repositories/UserRepository');
const AccessLevel = require('@src/domain/enums/AccessLevel');
const NotFoundError = require('@src/domain/errors/NotFoundError');
const ValidationError = require('@src/domain/errors/ValidationError');
const ForbiddenError = require('@src/domain/errors/ForbiddenError');

jest.mock('@src/infra/database/repositories/UserRepository');

function buildUser(overrides = {}) {
    return {
        id: 1,
        username: 'johndoe',
        disabled: false,
        validate: jest.fn().mockReturnValue({
            isValid: true,
            errors: []
        }),
        ...overrides,
    };
}

describe('DeleteUserUseCase', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('id validation', () => {
        it.each([undefined, null, 0, ''])('should return ValidationError when id is invalid', async (id) => {
            const authenticatedUser = { id: 1, accessLevel: AccessLevel.USER };

            await expect(DeleteUserUseCase.execute(authenticatedUser, id)).rejects.toThrow(ValidationError);

            expect(UserRepository.findById).not.toHaveBeenCalled();
        });
    });

    describe('user validation', () => {
        it('should return NotFoundError when user doesnt exist', async () => {
            UserRepository.findById.mockResolvedValue(null);

            const authenticatedUser = { id: 1, accessLevel: AccessLevel.USER };

            await expect(DeleteUserUseCase.execute(authenticatedUser, 1)).rejects.toThrow(NotFoundError);

            expect(UserRepository.findById).toHaveBeenCalledWith(1);
            expect(UserRepository.update).not.toHaveBeenCalled();
        });

        it('should return ForbiddenError when user is not owner or admin', async () => {
            const user = buildUser({ id: 99 });
            UserRepository.findById.mockResolvedValue(user);

            const authenticatedUser = { id: 1, accessLevel: AccessLevel.USER };

            await expect(DeleteUserUseCase.execute(authenticatedUser, user.id)).rejects.toThrow(ForbiddenError);

            expect(UserRepository.update).not.toHaveBeenCalled();
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

            await expect(DeleteUserUseCase.execute(authenticatedUser, user.id)).rejects.toThrow(ValidationError);

            expect(user.disabled).toBe(true);
            expect(UserRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('user deletion', () => {
        it('should disable user when authenticated user is owner', async () => {
            const user = buildUser({ id: 1 });

            UserRepository.findById.mockResolvedValue(user);
            UserRepository.update.mockResolvedValue(user);

            const authenticatedUser = { id: 1, accessLevel: AccessLevel.USER };

            await DeleteUserUseCase.execute(authenticatedUser, user.id);

            expect(user.disabled).toBe(true);
            expect(user.validate).toHaveBeenCalled();
            expect(UserRepository.update).toHaveBeenCalledWith(user);
        });

        it('should disable user when authenticated user is admin', async () => {
            const user = buildUser({ id: 99 });

            UserRepository.findById.mockResolvedValue(user);
            UserRepository.update.mockResolvedValue(user);

            const authenticatedUser = { id: 1, accessLevel: AccessLevel.ADMIN };

            await DeleteUserUseCase.execute(authenticatedUser, user.id);

            expect(user.disabled).toBe(true);
            expect(UserRepository.update).toHaveBeenCalledWith(user);
        });
    });
});