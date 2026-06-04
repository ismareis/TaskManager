const AccessLevel = require("../enums/AcessLevel")
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
    validateRequiredMaxLength(value, fieldName, maxLength, errors) {
        if (!value || value.trim().length === 0) {
            errors.push(`${fieldName} is required`);
            return;
        }

        if (value.length > maxLength) {
            errors.push(`${fieldName} must have at most ${maxLength} characters`);
        }
    }
    validate() {
        const errors = [];

        this.validateRequiredMaxLength(this.name, 'Name', 100, errors);
        this.validateRequiredMaxLength(this.username, 'Username', 20, errors);
        this.validateRequiredMaxLength(this.role, 'Role', 100, errors);
        this.validateRequiredMaxLength(this.password, 'Password', 20, errors);

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
}

module.exports = User;