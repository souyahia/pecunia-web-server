import { validate } from 'class-validator';
import { EntityValidationError } from '../errors';

export default class ValidableEntity {
  async validate?(): Promise<void> {
    const errors = await validate(this);
    if (errors.length > 0) {
      throw new EntityValidationError('Entity validation failed', errors);
    }
  }
}
