const knex = require('../knex/connection');
const UserMapper = require('../mappers/UserMapper');

class UserRepository {
    async findByUsername(username) {
        const row = await knex('users')
            .where({ username })
            .first();

        return UserMapper.toDomain(row);
    }
}

module.exports = new UserRepository();