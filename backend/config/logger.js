const winston = require('winston');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'senmool-backend' },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...rest }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(rest).length ? JSON.stringify(rest, null, 2) : ''
          }`;
        })
      ),
    }),

    // Error logs
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
    }),

    // All logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
    }),

    // Alert logs
    new winston.transports.File({
      filename: path.join(logsDir, 'alerts.log'),
      format: winston.format.printf((info) => {
        if (info.type === 'alert') {
          return JSON.stringify(info);
        }
        return '';
      }),
    }),
  ],
});

// Log exception handler
logger.exceptions.handle(
  new winston.transports.File({ filename: path.join(logsDir, 'exceptions.log') })
);

// Log rejection handler
logger.rejections.handle(
  new winston.transports.File({ filename: path.join(logsDir, 'rejections.log') })
);

module.exports = logger;
