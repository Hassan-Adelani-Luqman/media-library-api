import express from 'express';
import mediaRoutes from './routes/media.routes.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import { requestLogger } from './middlewares/requestLogger.middleware.js';
import { AppError } from './utils/AppError.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/media', mediaRoutes);

app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

export default app;
