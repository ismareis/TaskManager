const DomainError = require('../../../domain/errors/DomainError');
const LoggerService = require('../../services/LoggerService');

function errorHandler(error, req, res, next) {
    if (error instanceof DomainError) {
        res.status(error.statusCode);
        LoggerService.error(req, res, error);
        return res.json({
            message: error.message,
            errors: error.errors
        });
    }

    res.status(500);
    LoggerService.error(req, res, error);
    return res.json({
        message: 'Internal server error'
    });
}

module.exports = errorHandler;