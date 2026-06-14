const AccessLevel = require("../enums/AcessLevel")
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
        tokenVersion = 1
    }) {
        this.id = id;
        this.name = name;
        this.username = username;
        this.password = password;
        this.role = role;
        this.accessLevel = accessLevel;
        this.disabled = disabled;
        this.tokenVersion = tokenVersion;
    }
    validateRequired(fieldName, value, errors) {
        if (!value || value.trim().length === 0) {
            errors.push(`${fieldName} is required`);
            return;
        }
    }
    validateRequiredMaxLength(value, fieldName, maxLength, errors) {
        this.validateRequired(fieldName, value, errors);

        if (value.length > maxLength) {
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
}

module.exports = User;