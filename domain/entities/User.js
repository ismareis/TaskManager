class User {
    constructor({
        id,
        name,
        username,
        password,
        role,
        accessLevel,
        disabled = false,
        googleAccessToken = null,
        googleRefreshToken = null,
        googleTokenExpiry = null
    }) {
        this.id = id;
        this.name = name;
        this.username = username;
        this.password = password;
        this.role = role;
        this.accessLevel = accessLevel;
        this.disabled = disabled;
        this.googleAccessToken = googleAccessToken;
        this.googleRefreshToken = googleRefreshToken;
        this.googleTokenExpiry = googleTokenExpiry;
    }
}

module.exports = User;