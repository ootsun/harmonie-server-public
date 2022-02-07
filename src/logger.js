import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import fs from 'fs';
import path from 'path';

const logDir = process.env.LOG_DIR;
const consoleLevel = process.env.LOG_CONSOLE_LEVEL;
const fileLevel = process.env.LOG_FILE_LEVEL;
const fileStorageDuration = process.env.LOG_FILE_STORAGE_DURATION;
const fileMaxSize = process.env.LOG_FILE_MAX_SIZE;

// Create the log directory if it does not exist
console.log("Log repository (" + logDir + ") exists ? " + fs.existsSync(logDir));
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
    console.log("mkdir logDir done and did it worked ? " + fs.existsSync(logDir));
}

const filename = path.join(logDir, 'app.log');

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: consoleLevel,
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp({
                    format: 'HH:mm:ss',
                }),
                winston.format.printf(
                    (info) =>
                        `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`
                )
            ),
        }),
        new DailyRotateFile({
            level: fileLevel,
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'HH:mm:ss.SSS',
                }),
                winston.format.printf(
                    (info) =>
                        `${info.timestamp} [${info.level.toUpperCase()}] - ${info.message}`
                )
            ),
            filename,
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxFiles: fileStorageDuration,
            maxSize: fileMaxSize,
        }),
    ],
});

logger.stream = {
    write: function (message, encoding) {
        logger.info(message);
    },
};

function format(message) {
    let errorLine = new Error().stack.split('\n')[3];
    errorLine = errorLine.slice(errorLine.lastIndexOf('/') + 1);
    if (errorLine.endsWith(')')) {
        errorLine = errorLine.slice(0, errorLine.length - 1);
    }
    return errorLine + ' : ' + message;
}

const log = {
    debug: (message) => {
        logger.debug(format(message));
    },
    info: (message) => {
        logger.info(format(message));
    },
    warn: (message) => {
        logger.warn(format(message));
    },
    error: (message) => {
        logger.error(format(message));
    },
    stream: logger.stream
}

export default log;
