import express from 'express';
import { json, urlencoded } from 'body-parser';
import logger from './logger';
import { pingRouter, authRouter, usersRouter, endpointErrorRouter } from './routers';
import { logMiddleware, errorhandlerMiddleware } from './middleware';

logger.debug('Creating Express app...');
const app = express();

app.use(logMiddleware);
app.use(json());
app.use(urlencoded({ extended: true }));

app.use(pingRouter);
app.use(authRouter);
app.use(usersRouter);
app.use(endpointErrorRouter);

if (process.env.NODE_ENV === 'development') {
  app.use(errorhandlerMiddleware);
}

logger.debug('Express app successfully created.');

export default app;
