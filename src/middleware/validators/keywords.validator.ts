/* eslint-disable @typescript-eslint/no-explicit-any */
import { body } from 'express-validator';
import validate from 'uuid-validate';

const keywordsValidator = body('keywords')
  .optional()
  .isArray()
  .custom((keywords: any[]) => {
    for (let i = 0; i < keywords.length; i++) {
      if (!keywords[i]) {
        throw new Error('keywords param must not contain null or undefined values');
      } else if (typeof keywords[i].value !== 'string') {
        throw new Error('keywords values must be strings');
      } else if (keywords[i].value.length === 0) {
        throw new Error('keywords values must not be empty');
      } else if (keywords[i].value.length > 255) {
        throw new Error('keywords values must not exceed 255 characters');
      } else if (keywords[i].id) {
        if (typeof keywords[i].id !== 'string') {
          throw new Error('keywords ids must be strings');
        } else if (!validate(keywords[i].id, 4)) {
          throw new Error('keywords ids must be uuids v4');
        }
      }
    }
    return true;
  });

export default keywordsValidator;
