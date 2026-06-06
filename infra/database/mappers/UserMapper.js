const User = require("../../../domain/entities/User");

class UserMapper {
    static toDomain(row) {
        if (!row) return null;

        return new User ({
            id: row.id,
            name: row.name, 
            username: row.username,
            password: row.password,
            role: row.role,
            accessLevel: row.access_level,
            disabled: row.disabled,
            tokenVersion: row.token_version
        });
    }

    static toPersistence(user) {
        if (!user) return null;

        return {
            id: user.id,
            name: user.name,
            username: user.username,
            password: user.password,
            role: user.role,
            access_level: user.accessLevel,
            disabled: user.disabled,
            token_version: user.tokenVersion
        };
    }
}

module.exports = UserMapper;