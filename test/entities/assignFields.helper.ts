import { ValidableEntity } from '../../src/entities';

export default function assignFields<T extends ValidableEntity>(
  entity: T,
  validFields: Partial<T>,
  invalidFields?: Partial<T>
): T {
  Object.assign(entity, validFields);
  if (invalidFields) {
    Object.assign(entity, invalidFields);
  }
  return entity;
}
