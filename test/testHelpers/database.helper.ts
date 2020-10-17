import { Connection } from 'typeorm';
import { ValidableEntity } from '../../src/entities';

export async function clearDB(connection: Connection): Promise<void> {
  const entities = connection.entityMetadatas;
  const promises: Promise<unknown>[] = [];
  for (let i = 0; i < entities.length; i++) {
    const repository = connection.getRepository(entities[i].name);
    promises.push(repository.query(`DELETE FROM ${entities[i].tableName};`));
  }
  await Promise.all(promises);
}

export async function clearRepository(
  connection: Connection,
  entity: typeof ValidableEntity,
): Promise<void> {
  const metadata = connection.getMetadata(entity);
  const repository = connection.getRepository(metadata.name);
  await repository.query(`DELETE FROM ${metadata.tableName};`);
}
