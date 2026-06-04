const knex = require('knex');

module.exports = {
  up: async (knex) => {
    await knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('username').notNullable().unique();
      table.string('password').notNullable();
      table.string('role').notNullable();
      table.integer('access_level').notNullable();
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