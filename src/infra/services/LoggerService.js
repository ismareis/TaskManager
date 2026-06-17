const path = require('path');

const { createLogger, format, transports } = require('winston');

const { combine, timestamp, printf, colorize } = format;

const isTest = process.env.NODE_ENV === 'test';

class LoggerService {
    static #logFormat = printf(({ level, message, timestamp }) => {
        return `[${timestamp}] ${level}: ${message}`;
    });

    static #logger = createLogger({
        silent: isTest,
        format: combine(
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            LoggerService.#logFormat
        ),
        transports: [
            new transports.File({
                filename: path.join(process.cwd(), 'logs', 'errors.log'),
                level: 'error',
            }),
            new transports.File({
                filename: path.join(process.cwd(), 'logs', 'combined.log'),
            }),
            new transports.File({
                filename: path.join(process.cwd(), 'logs', 'bugs.log'),
                level: 'error',
                format: format(info => info.isBug ? info : false)(),
            }),
        ],
    });

    static {
        if(!isTest)
        {
            LoggerService.#logger.add(new transports.Console({
                    format: combine(
                        colorize(),
                        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                        LoggerService.#logFormat
                    ),
                }));
        }
    }

    static info(req, res) {
        LoggerService.#logger.info(LoggerService.formatMessage(req, res));
    }

    static error(req, res, error) {
        const isBug = res.statusCode === 500;
        LoggerService.#logger.error(LoggerService.formatMessage(req, res, error), { isBug });
    }

    static formatMessage(req, res, error) {
        const parts = [
            `${req.method} ${req.originalUrl}`,
            `Status: ${res.statusCode}`,
        ];

        if (error) {
            parts.push(`Error: ${error.message}`);
            if (Array.isArray(error.errors))
                parts.push(error.errors.join(", "));
            else if (error.errors)
                parts.push(String(error.errors));
        }

        return parts.join(' | ');
    }
}

module.exports = LoggerService;