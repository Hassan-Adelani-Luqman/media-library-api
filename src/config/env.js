export const config = {
  port: process.env.PORT || 3000,
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSizeBytes: 5 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
};
