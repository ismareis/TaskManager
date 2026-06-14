const knex = require('knex');
const AcessLevel = require('../../../../domain/enums/AccessLevel');

module.exports = {
  up: async (knex) => {
    await knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.string('username', 20).notNullable().unique();
      table.string('password', 255).notNullable();
      table.string('role', 100).notNullable();
      table.integer('access_level').notNullable().checkIn(AcessLevel.All);
      table.boolean('disabled').notNullable().defaultTo(false);
      table.integer('token_version').notNullable().defaultTo(1);

      table.string('google_access_token', 512).nullable();
      table.string('google_refresh_token', 512).nullable();
      table.datetime('google_token_expiry').nullable();
    });
  },

  down: async (knex) => {
    await knex.schema.dropTable('users');
  },
};