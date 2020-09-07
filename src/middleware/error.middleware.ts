import { Request } from 'express';
import errorhandler from 'errorhandler';
import logger from '../logger';

function log(err: Error, str: string, req: Request): void {
  logger.error(`Error in ${req.method} ON ${req.url}`, err);
}

const errorhandlerMiddleware = errorhandler({ log });

export default errorhandlerMiddleware;
