import { Connection } from 'typeorm';

export async function clearDB(connection: Connection): Promise<void> {
  let repo = connection.getRepository('Keywords');
  await repo.query('DELETE FROM Keywords;');

  repo = connection.getRepository('TransactionCategories');
  await repo.query('DELETE FROM TransactionCategories;');

  repo = connection.getRepository('Categories');
  await repo.query('DELETE FROM Categories;');

  repo = connection.getRepository('Transactions');
  await repo.query('DELETE FROM Transactions;');

  repo = connection.getRepository('Users');
  await repo.query('DELETE FROM Users;');
}
