import winston from 'winston';
import { config } from './env.js';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} [${level}] ${stack || message}${extra}`;
  })
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

export const logger = winston.createLogger({
  level: config.logLevel,
  format: config.nodeEnv === 'production' ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
});
