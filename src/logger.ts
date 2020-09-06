/* eslint-disable @typescript-eslint/no-unsafe-call */
import { createLogger, LogLevelString, Stream } from 'bunyan';
import bunyanDebugStream from 'bunyan-debug-stream';
import config from './config';

const level = config.get('Logger:Level') as LogLevelString;
let stream: Stream = null;

switch (config.get('Logger:Stream')) {
  case 'stdout':
    stream = {
      level,
      stream: process.stdout,
    };
    break;
  case 'bunyan-debug-stream':
    stream = {
      level,
      stream: bunyanDebugStream({
        basepath: __dirname,
        forceColor: true,
      }),
    };
    break;
  default:
    throw new Error(`Unknown Logger Stream : ${config.get('Logger:Stream') as string}.`);
}

const logger = createLogger({
  name: 'pecunia-ws-logger',
  level,
  streams: [stream],
  serializers: bunyanDebugStream.serializers,
});

export default logger;
