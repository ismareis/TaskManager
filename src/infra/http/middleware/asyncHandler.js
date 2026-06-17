const LoggerService = require('../../services/LoggerService');

module.exports = (handler) =>
    (req, res, next) =>
        Promise.resolve(handler(req, res, next))
            .then(() => {
                LoggerService.info(req, res);
            })
            .catch(next);