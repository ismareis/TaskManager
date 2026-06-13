const DomainError = require('./DomainError');

class ConflictError extends DomainError {
    constructor(message = 'Already exists') {
        super(message, 409);
    }
}

module.exports = ConflictError;