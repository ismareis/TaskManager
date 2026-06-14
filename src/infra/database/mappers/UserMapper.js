const { google } = require("googleapis");
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
            tokenVersion: row.token_version,
            googleAccessToken: row.google_access_token,
            googleRefreshToken: row.google_refresh_token,
            googleTokenExpiry: row.google_token_expiry
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
            token_version: user.tokenVersion,
            google_access_token: user.googleAccessToken,
            google_refresh_token: user.googleRefreshToken,
            google_token_expiry: user.googleTokenExpiry
        };
    }
}

module.exports = UserMapper;