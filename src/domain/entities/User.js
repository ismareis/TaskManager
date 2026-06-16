const AccessLevel = require("../enums/AccessLevel")
class User {
    static NAME_MAX_LENGTH = 100;
    static USERNAME_MAX_LENGTH = 20;
    static ROLE_MAX_LENGTH = 100;


    constructor({
        id,
        name,
        username,
        password,
        role,
        accessLevel,
        disabled = false,
        tokenVersion = 1,
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
        this.tokenVersion = tokenVersion;
        this.googleAccessToken = googleAccessToken;
        this.googleRefreshToken = googleRefreshToken;
        this.googleTokenExpiry = googleTokenExpiry;
    }
    validateRequired(fieldName, value, errors) {
        if (value === undefined || value === null || String(value).trim().length === 0) {
            errors.push(`${fieldName} is required`);
            return false;
        }

        return true;
    }

    validateRequiredMaxLength(value, fieldName, maxLength, errors) {
        const isRequiredValid = this.validateRequired(fieldName, value, errors);

        if (!isRequiredValid) {
            return;
        }

        if (String(value).length > maxLength) {
            errors.push(`${fieldName} must have at most ${maxLength} characters`);
        }
    }
    validate() {
        const errors = [];

        this.validateRequiredMaxLength(this.name, 'Name', User.NAME_MAX_LENGTH, errors);
        this.validateRequiredMaxLength(this.username, 'Username', User.USERNAME_MAX_LENGTH, errors);
        this.validateRequiredMaxLength(this.role, 'Role', User.ROLE_MAX_LENGTH, errors);
        this.validateRequired(this.password, 'Password', errors);

        if (!AccessLevel.isValid(this.accessLevel)) {
            errors.push('Invalid access level');
        }

        if (typeof this.disabled !== 'boolean') {
            errors.push('Disabled must be a boolean');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    isGoogleAuthenticated() {
        return this.googleAccessToken && this.googleRefreshToken && this.googleTokenExpiry;
    }
}

module.exports = User;