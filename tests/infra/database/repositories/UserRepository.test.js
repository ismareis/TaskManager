const knex = require('@src/infra/database/knex/connection');
const UserRepository = require('@src/infra/database/repositories/UserRepository');
const User = require('@src/domain/entities/User');
const AccessLevel = require('@src/domain/enums/AccessLevel');

function buildUser(overrides = {}) {
    return new User({
        name: 'John Doe',
        username: 'johndoe',
        password: 'hashed_password_123',
        role: 'employee',
        accessLevel: AccessLevel.USER,
        disabled: false,
        tokenVersion: 1,
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
        ...overrides,
    });
}

describe('UserRepository', () => {
    beforeAll(async () => {
        await knex.migrate.latest();
    });

    afterEach(async () => {
        await knex('users').del();
    });

    afterAll(async () => {
        await knex.destroy();
    });

    describe('create', () => {
        it('should create user and return mapped to domain', async () => {
            const user = buildUser();

            const created = await UserRepository.create(user);

            expect(created).toBeTruthy();
            expect(created.id).toBeDefined();
            expect(created.name).toBe(user.name);
            expect(created.username).toBe(user.username);
            expect(created.role).toBe(user.role);
            expect(created.accessLevel).toBe(user.accessLevel);
            expect(created.disabled).toBe(false);
            expect(created.tokenVersion).toBe(1);
        });

        it('should not create two users with same username', async () => {
            await UserRepository.create(buildUser({ username: 'duplicated' }));

            const duplicated = buildUser({ username: 'duplicated' });

            await expect(UserRepository.create(duplicated)).rejects.toThrow();
        });
    });

    describe('findById', () => {
        it('should return user that is not disabled', async () => {
            const created = await UserRepository.create(buildUser({ username: 'findbyid' }));

            const found = await UserRepository.findById(created.id);

            expect(found).toBeTruthy();
            expect(found.id).toBe(created.id);
            expect(found.username).toBe('findbyid');
        });

        it('should not return user that is disabled', async () => {
            const created = await UserRepository.create(
                buildUser({ username: 'disableduser', disabled: true })
            );

            const found = await UserRepository.findById(created.id);

            expect(found).toBeFalsy();
        });

        it('should return empty when id not exists', async () => {
            const found = await UserRepository.findById(999999);

            expect(found).toBeFalsy();
        });
    });

    describe('findByUsername', () => {
        it('should return user that is not disabled', async () => {
            await UserRepository.create(buildUser({ username: 'byusername' }));

            const found = await UserRepository.findByUsername('byusername');

            expect(found).toBeTruthy();
            expect(found.username).toBe('byusername');
        });

        it('should not return user that is disabled', async () => {
            await UserRepository.create(
                buildUser({ username: 'disabledbyusername', disabled: true })
            );

            const found = await UserRepository.findByUsername('disabledbyusername');

            expect(found).toBeFalsy();
        });

        it('should return empty when username not exists', async () => {
            const found = await UserRepository.findByUsername('nao-existe');

            expect(found).toBeFalsy();
        });
    });

    describe('update', () => {
        it('should update existing user', async () => {
            const created = await UserRepository.create(buildUser({ username: 'toupdate' }));

            const toUpdate = buildUser({
                id: created.id,
                username: 'toupdate',
                name: 'Novo Nome',
                role: 'manager',
            });

            const updated = await UserRepository.update(toUpdate);

            expect(updated.id).toBe(created.id);
            expect(updated.name).toBe('Novo Nome');
            expect(updated.role).toBe('manager');

            const reloaded = await UserRepository.findById(created.id);
            expect(reloaded.name).toBe('Novo Nome');
            expect(reloaded.role).toBe('manager');
        });
    });

    describe('updateGoogleTokens', () => {
        it('should update access token and expiration date keeping refresh token when not informed', async () => {
            const created = await UserRepository.create(
                buildUser({
                    username: 'googleuser',
                    googleAccessToken: 'old-access-token',
                    googleRefreshToken: 'old-refresh-token',
                    googleTokenExpiry: new Date('2025-01-01T00:00:00Z'),
                })
            );

            const newExpiry = new Date('2026-01-01T00:00:00Z');

            await UserRepository.updateGoogleTokens(created.id, {
                googleAccessToken: 'new-access-token',
                googleRefreshToken: null,
                googleTokenExpiry: newExpiry,
            });

            const reloaded = await UserRepository.findById(created.id);

            expect(reloaded.googleAccessToken).toBe('new-access-token');
            expect(reloaded.googleRefreshToken).toBe('old-refresh-token');
            expect(new Date(reloaded.googleTokenExpiry)).toEqual(newExpiry);
        });

        it('should update refresh token when informed', async () => {
            const created = await UserRepository.create(
                buildUser({
                    username: 'googleuser2',
                    googleAccessToken: 'old-access-token',
                    googleRefreshToken: 'old-refresh-token',
                    googleTokenExpiry: new Date('2025-01-01T00:00:00Z'),
                })
            );

            const newExpiry = new Date('2026-01-01T00:00:00Z');

            await UserRepository.updateGoogleTokens(created.id, {
                googleAccessToken: 'new-access-token',
                googleRefreshToken: 'new-refresh-token',
                googleTokenExpiry: newExpiry,
            });

            const reloaded = await UserRepository.findById(created.id);

            expect(reloaded.googleAccessToken).toBe('new-access-token');
            expect(reloaded.googleRefreshToken).toBe('new-refresh-token');
            expect(new Date(reloaded.googleTokenExpiry)).toEqual(newExpiry);
        });
    });

    describe('clearGoogleTokens', () => {
        it('should clear all google tokens', async () => {
            const created = await UserRepository.create(
                buildUser({
                    username: 'googleuser3',
                    googleAccessToken: 'access-token',
                    googleRefreshToken: 'refresh-token',
                    googleTokenExpiry: new Date('2025-01-01T00:00:00Z'),
                })
            );

            await UserRepository.clearGoogleTokens(created.id);

            const reloaded = await UserRepository.findById(created.id);

            expect(reloaded.googleAccessToken).toBeNull();
            expect(reloaded.googleRefreshToken).toBeNull();
            expect(reloaded.googleTokenExpiry).toBeNull();
        });
    });
});