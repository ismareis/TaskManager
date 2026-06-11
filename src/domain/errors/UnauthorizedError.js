const DomainError = require('./DomainError');

class UnauthorizedError extends DomainError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}

module.exports = UnauthorizedError;