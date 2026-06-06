const DomainError = require('./DomainError');

class ForbiddenError extends DomainError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}

module.exports = ForbiddenError;