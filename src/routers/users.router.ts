import express from 'express';
import { body } from 'express-validator';
import { usersController } from '../controllers';
import { paramsValidatorMiddleware } from '../middleware';

const usersRouter = express.Router();

/**
 * @api { get } /users Get all users.
 * @apiName GetUsers
 * @apiGroup Users
 *
 * @apiSuccess (200 OK) { Object[] } -          Array of users at the root of the response.
 * @apiSuccess (200 OK) { String }   -.id       The ID of the user.
 * @apiSuccess (200 OK) { String }   -.email    The email address of the user.
 * @apiSuccess (200 OK) { String }   -.password The password of the user.
 *
 * @apiSuccessExample Success Response:
 *    HTTP/1.1 200 OK
 *    [
 *      {
 *        "id": "d052f9c8-1734-4fa4-810c-c5836582daf7",
 *        "email": "john.doe@mail.com",
 *        "password": "johndoe1998",
 *      },
 *      ...
 *    ]
 */
usersRouter.get('/users', usersController.getUsers);

/**
 * @api { post } /users Create a new User
 * @apiName CreateUser
 * @apiGroup Users
 *
 * @apiParam (Body Parameters) { String } email    The email of the user.
 * @apiParam (Body Parameters) { String } password The password of the user.
 *
 * @apiSuccess (200 OK) { String }   id       The ID of the created user.
 * @apiSuccess (200 OK) { String }   email    The email address of the created user.
 * @apiSuccess (200 OK) { String }   password The password of the created user.
 *
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      "id": "d052f9c8-1734-4fa4-810c-c5836582daf7",
 *      "email": "john.doe@mail.com",
 *      "password": "johndoe1998",
 *    }
 *
 * @apiError (400 Bad Request) { String }   message         The error message.
 * @apiError (400 Bad Request) { Object[] } [errors]        Errors in the request parameters.
 * @apiError (400 Bad Request) { String }   errors.msg      Message of the parameter error.
 * @apiError (400 Bad Request) { String }   errors.param    Name of the parameter that caused the error.
 * @apiError (400 Bad Request) { String }   errors.location Location of the parameter that caused the error.
 * @apiError (400 Bad Request) { any }      [errors.value]  Value of the parameter that caused the error.
 *
 * @apiErrorExample Email Already Exists
 *    HTTP/1.1 400 Bad Request
 *    {
 *      "message": "Email already exists."
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
usersRouter.post(
  '/users',
  [body('email').isEmail(), body('password').isString().isLength({ min: 0, max: 30 })],
  paramsValidatorMiddleware,
  usersController.createUser
);

export default usersRouter;
