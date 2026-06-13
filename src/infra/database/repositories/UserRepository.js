const knex = require('../knex/connection');
const UserMapper = require('../mappers/UserMapper');

class UserRepository {
    async findById(id){
        const row = await knex('users')
            .where({ id })
            .first();

        return UserMapper.toDomain(row);
    }

    async findByUsername(username) {
        const row = await knex('users')
            .where({ username })
            .first();

        return UserMapper.toDomain(row);
    }

    async update(user) {
        const data = UserMapper.toPersistence(user);

        const [row] = await knex('users')
            .where({ id: user.id })
            .update(data)
            .returning('*');

        return UserMapper.toDomain(row);
    }

     async create(user) {
        const data = UserMapper.toPersistence(user);

        const [row] = await knex('users')
            .insert(data)
            .returning('*');

        return UserMapper.toDomain(row);
    }
}

module.exports = new UserRepository();