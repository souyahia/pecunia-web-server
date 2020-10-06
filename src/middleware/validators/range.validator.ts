import { query } from 'express-validator';

const rangeValidator = query('range')
  .optional()
  .custom((rangeStr: string) => {
    let range = null;
    try {
      range = JSON.parse(rangeStr);
      if (!Array.isArray(range)) {
        throw new Error('range param is not an Array.');
      }
    } catch (err) {
      throw new Error('Range parameter must be an Array.');
    }
    if (range.length !== 2) {
      throw new Error('Array must contain exactly 2 elements.');
    }
    for (let i = 0; i < 2; i++) {
      if (!Number.isInteger(range[i]) || range[i] < 0) {
        throw new Error('Array must contain positive integers.');
      }
    }
    if (range[1] < range[0]) {
      throw new Error('Second element must be greater (or equal) than the first element.');
    }
    return true;
  });

export default rangeValidator;
