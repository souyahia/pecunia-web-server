import { Keyword } from '../../src/entities';
import { assignFields } from '../testHelpers';
import { EntityValidationError } from '../../src/errors';

const validFields = {
  value: 'My Keyword',
};

const invalidFields = {
  value:
    'this-string-is-more-than-255-characters-tVWwg3wtqvVKF5EHdZ67GfPjzhrkxJfHCDhWNgNLGq29kP2ziW4icNiTpNNeGKEJhdwvf72ppwTPwafAGqXN3jzbM6bZfLwE7XMXYvtkeVrqDWCpnrjRgGrV62tP4V7PSSLc2dJXq8Aftp7xvEAT3qj7vrqAg3umxNg6JdPPhS7YA5zQzrDv7rgQAQywmbqPVWfGEQaHVtthV98LrbPKPQKwi',
};

describe('Keyword Entity', () => {
  it('shoud not throw when validating a valid entity', async (done) => {
    const keyword = new Keyword();
    assignFields(keyword, validFields);
    await expect(keyword.validate()).resolves.not.toThrow();
    done();
  });

  it('should throw an EntityValidationError when validating a Keyword with bad value', async (done) => {
    const keyword = new Keyword();
    assignFields(keyword, validFields, { value: invalidFields.value });
    await expect(keyword.validate()).rejects.toThrow(EntityValidationError);
    done();
  });
});
