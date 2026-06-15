const ClearGoogleTokensUseCase = require('@src/application/use-cases/google/ClearGoogleTokensUseCase');
const UserRepository = require('@src/infra/database/repositories/UserRepository');

const NotFoundError = require('@src/domain/errors/NotFoundError');
const UnauthorizedError = require('@src/domain/errors/UnauthorizedError');

jest.mock('@src/infra/database/repositories/UserRepository');

describe('ClearGoogleTokensUseCase', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should throw NotFoundError when user does not exist', async () => {
        UserRepository.findById.mockResolvedValue(null);

        await expect(
            ClearGoogleTokensUseCase.execute(1)
        ).rejects.toThrow(NotFoundError);

        expect(UserRepository.findById)
            .toHaveBeenCalledWith(1);

        expect(UserRepository.clearGoogleTokens)
            .not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError when user is not authenticated with google', async () => {
        const user = {
            isGoogleAuthenticated: jest.fn().mockReturnValue(false)
        };

        UserRepository.findById.mockResolvedValue(user);

        await expect(
            ClearGoogleTokensUseCase.execute(1)
        ).rejects.toThrow(UnauthorizedError);

        expect(user.isGoogleAuthenticated)
            .toHaveBeenCalled();

        expect(UserRepository.clearGoogleTokens)
            .not.toHaveBeenCalled();
    });

    it('should clear google tokens when user is authenticated', async () => {
        const user = {
            isGoogleAuthenticated: jest.fn().mockReturnValue(true)
        };

        UserRepository.findById.mockResolvedValue(user);
        UserRepository.clearGoogleTokens.mockResolvedValue();

        await ClearGoogleTokensUseCase.execute(1);

        expect(UserRepository.findById)
            .toHaveBeenCalledWith(1);

        expect(user.isGoogleAuthenticated)
            .toHaveBeenCalled();

        expect(UserRepository.clearGoogleTokens)
            .toHaveBeenCalledWith(1);
    });
});