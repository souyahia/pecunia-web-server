import { Category } from '../../src/entities';
import assignFields from './assignFields.helper';
import { EntityValidationError } from '../../src/errors';

const validFields = {
  name: 'My Category',
};

const invalidFields = {
  name:
    'this-string-is-more-than-255-characters-b7y2HFMGaCrJCixquNW4v9bfz58bEFQFGeKjqHDU4t8MbAAWLp3G4KBEZiPj9y9XJuTbKZ8WT5tuawDRDR8Ntem9RCCLPeqQeXm73pA3X9dWdRKhdgFbjG5JjKmik2mLdFpD9vt57JBhX79t2WXAYZEZMuPz36Hp2GMZiVx5Zm9arbEfuJK7AMe885CyexTP5D78JKEUQ7cP9KiiifGMRCjQA',
};

describe('Category entity', () => {
  it('shoud not throw when validating a valid entity', () => {
    const category = new Category();
    assignFields(category, validFields);
    expect(async () => category.validate()).not.toThrow();
  });

  it('should throw an EntityValidationError when validating a Category with bad name', async (done) => {
    const category = new Category();
    assignFields(category, validFields, { name: invalidFields.name });
    await expect(category.validate()).rejects.toThrow(EntityValidationError);
    done();
  });
});
