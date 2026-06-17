const ValidationError = require('../../domain/errors/ValidationError');
const GoogleCalendarService = require('../../infra/services/GoogleCalendarService');


async function googleConfig(req, res, next) {
    const validation = GoogleCalendarService.validateGoogleConfig();

    if(!validation.isValid)
        throw new ValidationError(validation.errors);

    next();
}

module.exports = googleConfig;