const LoginUseCase = require('@src/application/use-cases/auth/LoginUseCase');
const UserRepository = require('@src/infra/database/repositories/UserRepository');
const PasswordHasher = require('@src/infra/services/PasswordHasher');
const JwtService = require('@src/infra/services/JwtService');
const UnauthorizedError = require('@src/domain/errors/UnauthorizedError');

jest.mock('@src/infra/database/repositories/UserRepository');
jest.mock('@src/infra/services/PasswordHasher');
jest.mock('@src/infra/services/JwtService');

describe('LoginUseCase', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return a token when credentials are valid', async () => {
        const user = {
            id: 1,
            username: 'test',
            password: 'hashedPassword'
        };

        UserRepository.findByUsername.mockResolvedValue(user);
        PasswordHasher.compare.mockResolvedValue(true);
        JwtService.generateToken.mockReturnValue('fake-jwt-token');

        const token = await LoginUseCase.execute(
            'test',
            '123456'
        );

        expect(token).toBe('fake-jwt-token');

        expect(UserRepository.findByUsername).toHaveBeenCalledWith('test');

        expect(PasswordHasher.compare).toHaveBeenCalledWith('123456', 'hashedPassword');

        expect(JwtService.generateToken).toHaveBeenCalledWith(user);
    });

    it('should throw UnauthorizedError when user does not exist', async () => {
        UserRepository.findByUsername.mockResolvedValue(null);

        await expect(
            LoginUseCase.execute('ismael', '123456')
        ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError when password is invalid', async () => {
        UserRepository.findByUsername.mockResolvedValue({
            id: 1,
            username: 'test',
            password: 'hashedPassword'
        });

        PasswordHasher.compare.mockResolvedValue(false);

        await expect(
            LoginUseCase.execute('test', '123456')
        ).rejects.toThrow(UnauthorizedError);
    });
});