import { v4 } from 'uuid';
import { Category } from '../../src/entities';
import { assignFields } from '../testHelpers';
import { EntityValidationError } from '../../src/errors';

const validFields = {
  id: v4(),
  name: 'My Category',
  matchAll: true,
};

const invalidFields = {
  id: 'not-a-uuid',
  name:
    'this-string-is-more-than-255-characters-b7y2HFMGaCrJCixquNW4v9bfz58bEFQFGeKjqHDU4t8MbAAWLp3G4KBEZiPj9y9XJuTbKZ8WT5tuawDRDR8Ntem9RCCLPeqQeXm73pA3X9dWdRKhdgFbjG5JjKmik2mLdFpD9vt57JBhX79t2WXAYZEZMuPz36Hp2GMZiVx5Zm9arbEfuJK7AMe885CyexTP5D78JKEUQ7cP9KiiifGMRCjQA',
  matchAll: undefined,
};

describe('Category Entity', () => {
  it('shoud not throw when validating a valid entity', async (done) => {
    const category = new Category();
    assignFields(category, validFields);
    await expect(category.validate()).resolves.not.toThrow();
    done();
  });

  it('should throw an EntityValidationError when validating a Category with bad id', async (done) => {
    const category = new Category();
    assignFields(category, validFields, { id: invalidFields.id });
    await expect(category.validate()).rejects.toThrow(EntityValidationError);
    done();
  });

  it('should throw an EntityValidationError when validating a Category with bad name', async (done) => {
    const category = new Category();
    assignFields(category, validFields, { name: invalidFields.name });
    await expect(category.validate()).rejects.toThrow(EntityValidationError);
    done();
  });

  it('should throw an EntityValidationError when validating a Category with bad matchAll', async (done) => {
    const category = new Category();
    assignFields(category, validFields, { matchAll: invalidFields.matchAll });
    await expect(category.validate()).rejects.toThrow(EntityValidationError);
    done();
  });
});
