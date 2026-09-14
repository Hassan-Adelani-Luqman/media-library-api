import dotenvFlow from 'dotenv-flow';

dotenvFlow.config({ node_env: process.env.NODE_ENV || 'development' });

const REQUIRED_VARS = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'MAX_FILE_SIZE_MB',
  'UPLOAD_DIR',
  'LOG_LEVEL',
];

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
  }
}

try {
  validateEnv();
} catch (err) {
  console.error(`Environment validation failed: ${err.message}`);
  process.exit(1);
}

export const config = {
  nodeEnv: process.env.NODE_ENV,
  port: Number(process.env.PORT),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  uploadDir: process.env.UPLOAD_DIR,
  maxFileSizeBytes: Number(process.env.MAX_FILE_SIZE_MB) * 1024 * 1024,
  logLevel: process.env.LOG_LEVEL,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
};
