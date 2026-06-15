const SaveGoogleTokensUseCase = require('@src/application/use-cases/google/SaveGoogleTokensUseCase');
const UserRepository = require('@src/infra/database/repositories/UserRepository');

const NotFoundError = require('@src/domain/errors/NotFoundError');
const ValidationError = require('@src/domain/errors/ValidationError');

jest.mock('@src/infra/database/repositories/UserRepository');

describe('SaveGoogleTokensUseCase', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should throw NotFoundError when user does not exist', async () => {
        UserRepository.findById.mockResolvedValue(null);

        await expect(
            SaveGoogleTokensUseCase.execute({
                userId: 1,
                tokens: {
                    access_token: 'token'
                }
            })
        ).rejects.toThrow(NotFoundError);

        expect(UserRepository.findById)
            .toHaveBeenCalledWith(1);

        expect(UserRepository.updateGoogleTokens)
            .not.toHaveBeenCalled();
    });

    it('should throw ValidationError when access token is missing', async () => {
        UserRepository.findById.mockResolvedValue({
            id: 1
        });

        await expect(
            SaveGoogleTokensUseCase.execute({
                userId: 1,
                tokens: {}
            })
        ).rejects.toThrow(ValidationError);

        expect(UserRepository.updateGoogleTokens)
            .not.toHaveBeenCalled();
    });

    it('should save google tokens', async () => {
        const expiryDate = Date.now() + 3600000;

        UserRepository.findById.mockResolvedValue({
            id: 1
        });

        UserRepository.updateGoogleTokens
            .mockResolvedValue();

        await SaveGoogleTokensUseCase.execute({
            userId: 1,
            tokens: {
                access_token: 'access-token',
                refresh_token: 'refresh-token',
                expiry_date: expiryDate
            }
        });

        expect(UserRepository.updateGoogleTokens)
            .toHaveBeenCalledWith(
                1,
                {
                    googleAccessToken: 'access-token',
                    googleRefreshToken: 'refresh-token',
                    googleTokenExpiry: new Date(expiryDate)
                }
            );
    });
});