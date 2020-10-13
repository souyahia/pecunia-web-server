import { v4 } from 'uuid';
import { User } from '../../src/entities';
import { assignFields } from '../testHelpers';
import { EntityValidationError } from '../../src/errors';
import { UserRole } from '../../src/auth';

const validFields = {
  id: v4(),
  email: 'test@gmail.com',
  password: '$2b$10$hDrbc3t.Ld8P8jHqhYe6eO5TQdigqvyrVjQXmq7gbXDTLcBohlZIS',
  role: UserRole.User,
};

const invalidFields = {
  id: 'not-a-uuid',
  email: 'test-gmail.com',
  password:
    'this-string-is-more-than-255-characters-7vvtfJ4G3xM6n384QA5DLm79fEtc2BepPHFxh7x88hqDRZAqtqUTzVewZgfxCKMhmBxfuBwvKzpnpWWjDcthhnwFvBn9biRNeiniWeFT9cRUqFbDJTqMU7WyBSBJiUCUcBecYAShT3Vrjh8RmkWe6uMqPDNPq2VQu68uhLpZGnEUUQKbATiY9jtfxQbhXyEfXuduBz7VHiRjkBGcg7Jh8Ej78',
  role: 'TEST',
};

describe('User entity', () => {
  it('shoud not throw when validating a valid entity', () => {
    const user = new User();
    assignFields(user, validFields);
    expect(async () => user.validate()).not.toThrow();
  });

  it('should throw an EntityValidationError when validating a User with bad id', async (done) => {
    const user = new User();
    assignFields(user, validFields, { id: invalidFields.id });
    await expect(user.validate()).rejects.toThrow(EntityValidationError);
    done();
  });

  it('should throw an EntityValidationError when validating a User with bad email', async (done) => {
    const user = new User();
    assignFields(user, validFields, { email: invalidFields.email });
    await expect(user.validate()).rejects.toThrow(EntityValidationError);
    done();
  });

  it('should throw an EntityValidationError when validating a User with bad password', async (done) => {
    const user = new User();
    assignFields(user, validFields, { password: invalidFields.password });
    await expect(user.validate()).rejects.toThrow(EntityValidationError);
    done();
  });

  it('should throw an EntityValidationError when validating a User with bad role', async (done) => {
    const user = new User();
    assignFields(user, validFields, { role: invalidFields.role });
    await expect(user.validate()).rejects.toThrow(EntityValidationError);
    done();
  });
});
