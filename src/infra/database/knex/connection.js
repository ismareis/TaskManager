const knex = require('knex');
const config = require('./knexFile');

const connection = knex(config.development);

module.exports = connection;