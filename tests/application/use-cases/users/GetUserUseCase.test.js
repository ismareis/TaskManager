const GetUserUseCase = require('@src/application/use-cases/users/GetUserUseCase');
const UserRepository = require('@src/infra/database/repositories/UserRepository');
const AccessLevel = require('@src/domain/enums/AccessLevel');
const NotFoundError = require('@src/domain/errors/NotFoundError');
const ValidationError = require('@src/domain/errors/ValidationError');

jest.mock('@src/infra/database/repositories/UserRepository');

function buildUser(overrides = {}) {
    return {
        id: 1,
        username: 'johndoe',
        name: 'John Doe',
        role: 'employee',
        accessLevel: AccessLevel.USER,
        ...overrides,
    };
}

describe('GetUserUseCase', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('id validation', () => {
        it.each([undefined, null, 0, ''])('should return ValidationError when id is invalid', async (id) => {
            await expect(GetUserUseCase.execute(id)).rejects.toThrow(ValidationError);

            expect(UserRepository.findById).not.toHaveBeenCalled();
        });
    });

    describe('non existent user', () => {
        it('should return NotFoundError', async () => {
            UserRepository.findById.mockResolvedValue(null);

            await expect(GetUserUseCase.execute(1)).rejects.toThrow(NotFoundError);

            expect(UserRepository.findById).toHaveBeenCalledWith(1);
        });
    });

    describe('response presentation', () => {
        it('should return user on expected format', async () => {
            const user = buildUser({
                id: 5,
                username: 'gabriel',
                name: 'Gabriel',
                role: 'developer',
                accessLevel: AccessLevel.ADMIN
            });

            UserRepository.findById.mockResolvedValue(user);

            const result = await GetUserUseCase.execute(user.id);

            expect(result).toEqual({
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                accessLevel: AccessLevel.toPresentation(user.accessLevel)
            });
        });
    });
});