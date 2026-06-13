const LogoutUseCase = require('@src/application/use-cases/auth/LogoutUseCase');
const UserRepository = require('@src/infra/database/repositories/UserRepository');
const NotFoundError = require('@src/domain/errors/NotFoundError');

jest.mock('@src/infra/database/repositories/UserRepository');

describe('LogoutUseCase', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should increment tokenVersion and update the user', async () => {
        const user = {
            id: 1,
            tokenVersion: 3
        };

        UserRepository.findById.mockResolvedValue(user);
        UserRepository.update.mockResolvedValue();

        await LogoutUseCase.execute(1);

        expect(UserRepository.findById)
            .toHaveBeenCalledWith(1);

        expect(user.tokenVersion)
            .toBe(4);

        expect(UserRepository.update)
            .toHaveBeenCalledWith(user);
    });

    it('should throw NotFoundError when user does not exist', async () => {
        UserRepository.findById.mockResolvedValue(null);

        await expect(
            LogoutUseCase.execute(1)
        ).rejects.toThrow(NotFoundError);

        expect(UserRepository.update)
            .not.toHaveBeenCalled();
    });
});