const knex = require('knex');
const TaskStatus = require('../../../../domain/enums/TaskStatus');
const TaskPriority = require('../../../../domain/enums/TaskPriority');

module.exports = {
  up: async (knex) => {
    await knex.schema.createTable('tasks', (table) => {
      table.increments('id').primary();

      table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.index('user_id');

      table.string('title', 100).notNullable();
      table.string('description', 1000).nullable();

      table.integer('status').notNullable().checkIn(TaskStatus.All);
      table.integer('priority').notNullable().checkIn(TaskPriority.All);

      table.timestamp('due_date').notNullable();
      table.timestamp('completion_date').nullable();

      table.boolean('disabled').notNullable().defaultTo(false);

      table.string('google_event_id').nullable();
    });
  },

  down: async (knex) => {
    await knex.schema.dropTable('tasks');
  },
};