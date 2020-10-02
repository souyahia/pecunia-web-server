import { ValidationError } from 'class-validator';

export default class EntityValidationError extends Error {
  constructor(message: string, public errors: ValidationError[]) {
    super(message);
    Object.setPrototypeOf(this, EntityValidationError.prototype);
  }

  public toString(): string {
    return `${this.message} : ${JSON.stringify(this.errors)}\n${this.stack}`;
  }
}
