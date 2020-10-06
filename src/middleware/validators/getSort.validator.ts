import { query, ValidationChain } from 'express-validator';

export default function getSortValidator(fields: string[]): ValidationChain {
  return query('sort')
    .optional()
    .custom((sortStr: string) => {
      let sort = null;
      try {
        sort = JSON.parse(sortStr);
        if (!Array.isArray(sort)) {
          throw new Error('sort param is not an Array.');
        }
      } catch (err) {
        throw new Error('Sort parameter must be an Array.');
      }
      if (sort.length === 0) {
        throw new Error('Array must contain at least 2 elements.');
      }
      if (sort.length % 2 === 1) {
        throw new Error('Array length must be even.');
      }
      for (let i = 0; i < sort.length; i++) {
        if (i % 2 === 0) {
          if (!fields.includes(sort[i])) {
            throw new Error(
              `Fields must be included in the following values : ${JSON.stringify(fields)}.`
            );
          }
        } else if (sort[i] !== 'ASC' && sort[i] !== 'DESC') {
          throw new Error('Sort orders must be either "ASC" or "DESC".');
        }
      }
      return true;
    });
}
