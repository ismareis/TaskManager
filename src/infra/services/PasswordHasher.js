const bcrypt = require('bcrypt');

class PasswordHasher {
    static SALT_ROUNDS = 10;

    static async hash(password) {
        return bcrypt.hash(password, PasswordHasher.SALT_ROUNDS);
    }

    static async compare(password, hash) {
        return bcrypt.compare(password, hash);
    }
}

module.exports = PasswordHasher;