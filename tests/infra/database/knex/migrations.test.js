const knex = require('@src/infra/database/knex/connection');

describe('Migrations', () => {
    beforeAll(async () => {
        await knex.migrate.latest();
    });

    afterAll(async () => {
        await knex.migrate.rollback(undefined, true);
        await knex.destroy();
    });

    it('should create users table', async () => {
        const exists = await knex.schema.hasTable('users');

        expect(exists).toBe(true);
    });

    it('should create tasks table', async () => {
        const exists = await knex.schema.hasTable('tasks');

        expect(exists).toBe(true);
    });
});