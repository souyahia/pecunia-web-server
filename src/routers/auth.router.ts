import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers';
import { paramsValidatorMiddleware } from '../middleware';

const authRouter = Router();

/**
 * @api { post } /auth/login Log in and get a JWT Token
 * @apiName LogIn
 * @apiGroup Auth
 *
 * @apiParam (Body Parameters) { String } email    The email of the user.
 * @apiParam (Body Parameters) { String } password The password of the user.
 *
 * @apiSuccess (200 OK) { String }   message   The server's response message.
 * @apiSuccess (200 OK) { String }   token     The JWT Token.
 * @apiSuccess (200 OK) { String }   expiresIn Duration validity of the token in the [zeit/ms format](https://github.com/vercel/ms)
 *
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      "message": "Authentication successful.",
 *      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc4MGY2ZTEwLTA3MzYtNDhkOS1hYTQ3LWVjMDY5ODVkMmRkMSIsImVtYWlsIjoiYWRtaW5AZW1haWwuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNTk5NTIwMzY0LCJleHAiOjE2MDAxMjUxNjR9.ms9qn3A_IJ6LrQZhlPfi7mQ2TJp0SNF1hwBO3-nDuHs",
 *      "expiresIn": "7d"
 *    }
 *
 * @apiError (400 Bad Request) { String }   message         The error message.
 * @apiError (400 Bad Request) { Object[] } [errors]        Errors in the request parameters.
 * @apiError (400 Bad Request) { String }   errors.msg      Message of the parameter error.
 * @apiError (400 Bad Request) { String }   errors.param    Name of the parameter that caused the error.
 * @apiError (400 Bad Request) { String }   errors.location Location of the parameter that caused the error.
 * @apiError (400 Bad Request) { any }      [errors.value]  Value of the parameter that caused the error.
 *
 * @apiErrorExample Invalid Credentials
 *    HTTP/1.1 400 Bad Request
 *    {
 *      "message": "Invalid email / password combination."
 *    }
 *
 * @apiErrorExample Invalid request parameters.
 *    HTTP/1.1 400 Bad Request
 *    {
 *      "message": "Invalid request parameters.",
 *      "errors": [
 *        {
 *          "value": "john.doeàmail.com",
 *          "msg": "Invalid value",
 *          "param": "email",
 *          "location": "body"
 *        }
 *      ]
 *    }
 *
 */
authRouter.post(
  '/auth/login',
  [body('email').isEmail(), body('password').isString().notEmpty()],
  paramsValidatorMiddleware,
  authController.logIn
);

export default authRouter;
