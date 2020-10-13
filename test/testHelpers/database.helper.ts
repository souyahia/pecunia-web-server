import { Connection } from 'typeorm';

export async function clearDB(connection: Connection): Promise<void> {
  const entities = connection.entityMetadatas;
  const promises: Promise<unknown>[] = [];
  for (let i = 0; i < entities.length; i++) {
    const repository = connection.getRepository(entities[i].name);
    promises.push(repository.query(`DELETE FROM ${entities[i].tableName};`));
  }
  await Promise.all(promises);
}
