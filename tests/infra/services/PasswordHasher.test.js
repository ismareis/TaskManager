const PasswordHasher = require('@src/infra/services/PasswordHasher');

describe('PasswordHasher', () => {
    describe('hash', () => {
        it('should hash a password', async () => {
            const password = '123456';

            const hash = await PasswordHasher.hash(password);

            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
            expect(typeof hash).toBe('string');
        });
    });

    describe('compare', () => {
        it('should return true for a valid password', async () => {
            const password = '123456';

            const hash = await PasswordHasher.hash(password);

            const result = await PasswordHasher.compare(password, hash);

            expect(result).toBe(true);
        });

        it('should return false for an invalid password', async () => {
            const hash = await PasswordHasher.hash('123456');

            const result = await PasswordHasher.compare(
                'wrong-password',
                hash
            );

            expect(result).toBe(false);
        });
    });
});