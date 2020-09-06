import express from 'express';
import bodyParser from 'body-parser';
import logger from './logger';
import { pingRouter, usersRouter, endpointErrorRouter } from './routers';
import { logMiddleware, errorhandlerMiddleware } from './middleware';

logger.debug('Creating Express app...');
const app = express();

app.use(logMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(pingRouter);
app.use(usersRouter);
app.use(endpointErrorRouter);

if (process.env.NODE_ENV === 'development') {
  app.use(errorhandlerMiddleware);
}

logger.debug('Express app successfully created.');

export default app;
