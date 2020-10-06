import { header } from 'express-validator';

const authTokenValidator = header('authorization').isString().notEmpty();

export default authTokenValidator;
