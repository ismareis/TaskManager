require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',

    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    },

    migrations: {
      directory: './src/infra/database/knex/migrations'
    },

    seeds: {
      directory: './src/infra/database/knex/seeds'
    }
  }
};