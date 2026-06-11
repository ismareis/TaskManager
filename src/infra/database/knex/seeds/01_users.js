const PasswordHasher = require('../../../services/PasswordHasher');
const AccessLevel = require('../../../../domain/enums/AcessLevel');

exports.seed = async function(knex) {
    await knex('users').del();

    await knex('users').insert([
        {
            name: 'System Administrator',
            username: 'admin',
            password: await PasswordHasher.hash('admin123'),
            role: 'Administrator',
            access_level: AccessLevel.ADMIN,
            disabled: false
        },
        {
            name: 'Default User',
            username: 'user',
            password: await PasswordHasher.hash('user123'),
            role: 'User',
            access_level: AccessLevel.USER,
            disabled: false
        }
    ]);
};