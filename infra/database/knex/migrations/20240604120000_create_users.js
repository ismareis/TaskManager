const knex = require('knex');

module.exports = {
  up: async (knex) => {
    await knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.string('username', 20).notNullable().unique();
      table.string('password', 255).notNullable();
      table.string('role', 100).notNullable();
      table.integer('access_level').notNullable().checkIn([1, 2]);
      table.boolean('disabled').notNullable().defaultTo(false);
      table.text('google_access_token').nullable();
      table.text('google_refresh_token').nullable();
      table.timestamp('google_token_expiry').nullable();
    });
  },

  down: async (knex) => {
    await knex.schema.dropTable('users');
  },
};