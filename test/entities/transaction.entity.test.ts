import { Transaction } from '../../src/entities';
import assignFields from './assignFields.helper';
import { EntityValidationError } from '../../src/errors';

const validFields = {
  transaction: null,
  date: new Date(),
  amount: 50.64,
  type: 'DIRECTDEBIT',
  currency: 'EUR',
  balance: -0.94,
};

const invalidFields = {
  date: null,
  amount: NaN,
  name:
    'this-string-is-more-than-255-characters-xzmqqpHV2kMherwwQW8HxtWpZA34AkffmjyzmiTfq69V4wfmxkpGU5GckAEpjYcnqDSxywpfikp2Y9FF9pAQpxhZSZwhJhb23n3RDxucmTexVyVmCM27eHzf9hWwdhty9Vwp8cW7B2t3GRtYr3t6Baw6H4ibe229h3VWjEKQ5LWnr3HdMYhUQRMukbtPcGP8FijvPMRh53tRBbeFRYAfDGFMR',
  type: null,
  publicId:
    'this-string-is-more-than-255-characters-n6bCW9GwZr7hfpy95pmcNuvkHNtgjBtHTD2Bi2WfcD8hNkSXkFBjbB6z2nvTRGXCCAwZgPtrxePNLwXzBzD4q9gRL9JLEWyCHEK26eSb8BaQKFpgE5m2MVXB6vVH9jHY26bcqmzaaKUici7qn2YgdfF2MeKhMGqwDGAEuKGAdvDynretuJJPaVw939xkAZTrf53Ra9NqeZVujZ8ZLHbF6RRc5',
  currency: 'EUZ',
  balance: NaN,
  bankId: 'this-string-is-more-than-9-characters',
  accountId: 'this-string-is-more-than-22-characters',
};

describe('Transaction entity', () => {
  it('shoud not throw when validating a valid entity', () => {
    const transaction = new Transaction();
    assignFields(transaction, validFields);
    expect(async () => transaction.validate()).not.toThrow();
  });

  it('should throw an EntityValidationError when validating a Transaction with bad date', async (done) => {
    const transaction = new Transaction();
    assignFields(transaction, validFields, { date: invalidFields.date });
    await expect(transaction.validate()).rejects.toThrow(EntityValidationError);
    done();
  });

  it('should throw an EntityValidationError when validating a Transaction with bad amount', async (done) => {
    const transaction = new Transaction();
    assignFields(transaction, validFields, { amount: invalidFields.amount });
    await expect(transaction.validate()).rejects.toThrow(EntityValidationError);
    done();
  });

  it('should throw an EntityValidationError when validating a Transaction with bad name', async (done) => {
    const transaction = new Transaction();
    assignFields(transaction, validFields, { name: invalidFields.name });
    await expect(transaction.validate()).rejects.toThrow(EntityValidationError);
    done();
  });

  it('should throw an EntityValidationError when validating a Transaction with bad type', async (done) => {
    const transaction = new Transaction();
    assignFields(transaction, validFields, { type: invalidFields.type });
    await expect(transaction.validate()).rejects.toThrow(EntityValidationError);
    done();
  });

  it('should throw an EntityValidationError when validating a Transaction with bad publicId', async (done) => {
    const transaction = new Transaction();
    assignFields(transaction, validFields, { publicId: invalidFields.publicId });
    await expect(transaction.validate()).rejects.toThrow(EntityValidationError);
    done();
  });

  it('should throw an EntityValidationError when validating a Transaction with bad currency', async (done) => {
    const transaction = new Transaction();
    assignFields(transaction, validFields, { currency: invalidFields.currency });
    await expect(transaction.validate()).rejects.toThrow(EntityValidationError);
    done();
  });

  it('should throw an EntityValidationError when validating a Transaction with bad balance', async (done) => {
    const transaction = new Transaction();
    assignFields(transaction, validFields, { balance: invalidFields.balance });
    await expect(transaction.validate()).rejects.toThrow(EntityValidationError);
    done();
  });

  it('should throw an EntityValidationError when validating a Transaction with bad bankId', async (done) => {
    const transaction = new Transaction();
    assignFields(transaction, validFields, { bankId: invalidFields.bankId });
    await expect(transaction.validate()).rejects.toThrow(EntityValidationError);
    done();
  });

  it('should throw an EntityValidationError when validating a Transaction with bad accountId', async (done) => {
    const transaction = new Transaction();
    assignFields(transaction, validFields, { accountId: invalidFields.accountId });
    await expect(transaction.validate()).rejects.toThrow(EntityValidationError);
    done();
  });
});
