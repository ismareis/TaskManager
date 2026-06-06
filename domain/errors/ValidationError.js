const DomainError = require('./DomainError');

class ValidationError extends DomainError {
    constructor(errors) {
        super('Validation failed', 400);

        this.errors = errors;
    }
}

module.exports = ValidationError;