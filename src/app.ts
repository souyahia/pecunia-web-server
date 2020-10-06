import express from 'express';
import { json, urlencoded } from 'body-parser';
import logger from './logger';
import { pingRouter, authRouter, usersRouter, endpointErrorRouter } from './routers';
import { logMiddleware, errorHandlerMiddleware } from './middleware';

logger.debug('Creating Express app...');
const app = express();

app.use(logMiddleware);
app.use(json());
app.use(urlencoded({ extended: true }));

app.use(pingRouter);
app.use(authRouter);
app.use(usersRouter);
app.use(endpointErrorRouter);

app.use(errorHandlerMiddleware);

logger.debug('Express app successfully created.');

export default app;
