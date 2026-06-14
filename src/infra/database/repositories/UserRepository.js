const knex = require('../knex/connection');
const UserMapper = require('../mappers/UserMapper');

class UserRepository {
    async findById(id){
        const row = await knex('users')
            .where({ id,
                disabled: false
             })
            .first();

        return UserMapper.toDomain(row);
    }

    async findByUsername(username) {
        const row = await knex('users')
            .where({ username,
                disabled: false
             })
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
    
    async updateGoogleTokens(userId, { googleAccessToken, googleRefreshToken, googleTokenExpiry }) {
        const data = {
            google_access_token: googleAccessToken,
            google_token_expiry: googleTokenExpiry,
        };


        if (googleRefreshToken) {
            data.google_refresh_token = googleRefreshToken;
        }

        await knex('users')
        .where({ id: userId })
        .update(data);
    }

    async clearGoogleTokens(userId){
        await knex('users')
        .where({id: userId})
        .update({
            google_access_token: null,
            google_token_expiry: null,
            google_refresh_token: null
        });
    }
}

module.exports = new UserRepository();