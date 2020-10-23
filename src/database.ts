import { createConnection, ConnectionOptions, Connection } from 'typeorm';
import config from './config';
import logger from './logger';
import { Category, Keyword, Transaction, User } from './entities';

let connectionEntity: Connection = null;

export async function connectDB(): Promise<Connection> {
  const connectOptions: ConnectionOptions = {
    type: 'mysql',
    host: config.get('Database:Host') as string,
    port: config.get('Database:Port') as number,
    username: config.get('Database:User') as string,
    password: config.get('Database:Password') as string,
    database: config.get('Database:Database') as string,
    entities: [Category, Keyword, Transaction, User],
    logging: false,
    // logging: ["query", "error"],
  };
  logger.debug('Initating connection to database with the following configuration :');
  logger.debug(`- TYPE     : ${connectOptions.type}`);
  logger.debug(`- HOST     : ${connectOptions.host}`);
  logger.debug(`- PORT     : ${connectOptions.port}`);
  logger.debug(`- USERNAME : ${connectOptions.username}`);
  logger.debug(`- PASSWORD : ${connectOptions.password}`);
  logger.debug(`- DATABASE : ${connectOptions.database}`);
  connectionEntity = await createConnection(connectOptions);
  // await connectionEntity.synchronize(true);
  return connectionEntity;
}

export async function disconnectDB(): Promise<Connection> {
  await connectionEntity.close();
  return connectionEntity;
}
