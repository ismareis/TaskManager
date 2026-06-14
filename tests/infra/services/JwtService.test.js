const jwt = require('jsonwebtoken');
const JwtService = require('@src/infra/services/JwtService');
const AccessLevel = require("@src/domain/enums/AccessLevel")

jest.mock('jsonwebtoken');

describe('JwtService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
    });

    describe('generateToken', () => {
        it('should generate a token with user data', () => {
            const user = {
                id: 1,
                username: 'admin',
                accessLevel: AccessLevel.ADMIN,
                tokenVersion: 3
            };

            jwt.sign.mockReturnValue('mock-token');

            const result = JwtService.generateToken(user);

            expect(jwt.sign).toHaveBeenCalledWith(
                {
                    id: 1,
                    username: 'admin',
                    accessLevel: AccessLevel.ADMIN,
                    tokenVersion: 3
                },
                'test-secret'
            );

            expect(result).toBe('mock-token');
        });
    });

    describe('generateGoogleAuthToken', () => {
        it('should generate a google auth token with expiration', () => {
            jwt.sign.mockReturnValue('google-token');

            const result = JwtService.generateGoogleAuthToken(123);

            expect(jwt.sign).toHaveBeenCalledWith(
                { userId: 123 },
                'test-secret',
                { expiresIn: '10m' }
            );

            expect(result).toBe('google-token');
        });
    });

    describe('verifyToken', () => {
        it('should verify a token', () => {
            const payload = {
                id: 1,
                username: 'test'
            };

            jwt.verify.mockReturnValue(payload);

            const result = JwtService.verifyToken('valid-token');

            expect(jwt.verify).toHaveBeenCalledWith(
                'valid-token',
                'test-secret'
            );

            expect(result).toEqual(payload);
        });
    });
});