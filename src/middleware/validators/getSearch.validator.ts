import { query, ValidationChain } from 'express-validator';

export default function getSearchValidator(fields: string[]): ValidationChain {
  return query('search')
    .optional()
    .custom((searchStr: string) => {
      let search = null;
      try {
        search = JSON.parse(searchStr);
        if (!Array.isArray(search)) {
          throw new Error('search param is not an Array.');
        }
      } catch (err) {
        throw new Error('Search parameter must be an Array.');
      }
      if (search.length === 0) {
        throw new Error('Array must contain at least 2 elements.');
      }
      if (search.length % 2 === 1) {
        throw new Error('Array length must be even.');
      }
      for (let i = 0; i < search.length; i++) {
        if (i % 2 === 0) {
          if (!fields.includes(search[i])) {
            throw new Error(
              `Fields must be included in the following values : ${JSON.stringify(fields)}.`
            );
          }
        } else {
          if (typeof search[i] !== 'string') {
            throw new Error('Keywords must be strings.');
          }
          if (search[i].length === 0) {
            throw new Error('Keywords must be at least one character long.');
          }
        }
      }
      return true;
    });
}
