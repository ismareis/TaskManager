const DomainError = require('../../../domain/errors/DomainError');

function errorHandler(error, req, res, next) {
    if (error instanceof DomainError) {
        console.error("Status: " + error.statusCode);
        return res.status(error.statusCode).json({
            message: error.message,
            errors: error.errors
        });
    }

    console.error(error);

    return res.status(500).json({
        message: 'Internal server error'
    });
}

module.exports = errorHandler;