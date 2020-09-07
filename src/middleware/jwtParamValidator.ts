import { header } from 'express-validator';

const jwtParamValidator = header('authorization').isString().notEmpty();

export default jwtParamValidator;
