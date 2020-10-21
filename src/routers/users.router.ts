import { Router } from 'express';
import { body, param } from 'express-validator';
import { usersController } from '../controllers';
import {
  paramsValidatorMiddleware,
  authMiddleware,
  adminMiddleware,
  Validators,
  asyncWraper,
} from '../middleware';
import { USER_ROLES } from '../auth';

const usersRouter = Router();

/**
 * @api { get } /users Get all Users.
 * @apiName GetUsers
 * @apiGroup Users
 *
 * @apiParam (Query Parameters) { int[] }    [range]  Range for pagination. Ex : [3, 15] to get values from index 3 to 15.
 * @apiParam (Query Parameters) { String[] } [sort]   Sort for the results in the format : [field, order]. Order are either "ASC" or "DESC". Fields can be the following : "id", "email", "password" or "role".
 * @apiParam (Query Parameters) { String[] } [search] Filter results by searching keywords in fields with the format : [field, "keyword"]. Fields can be the following : "id", "email", "password" or "role".
 *
 * @apiSuccess (200 OK) { int }    count           Total number of Users in the database;
 * @apiSuccess (200 OK) { User[] } values          Array of Users matching the query.
 * @apiSuccess (200 OK) { String } values.id       The id of the User (uuid v4).
 * @apiSuccess (200 OK) { String } values.email    The email of the User.
 * @apiSuccess (200 OK) { String } values.password The encrypted password of the User.
 * @apiSuccess (200 OK) { String } values.role     The role of the User, either "ADMIN" or "USER".
 *
 * @apiSuccessExample Success Response:
 *    HTTP/1.1 200 OK
 *    [
 *      {
 *        "count": 10,
 *        "values" : [
 *          {
 *            "id": "d052f9c8-1734-4fa4-810c-c5836582daf7",
 *            "email": "john.doe@mail.com",
 *            "password": "$2b$10$rZIqIwmUmdOB12ECEinywu6UsH0HW06YwbeVX9T0yQBnHWWDKor6m",
 *            "role": "USER"
 *          },
 *          ...
 *        ]
 *    ]
 *
 * @apiError (403 Forbidden) { String } message The error message.
 *
 * @apiErrorExample Insufficient authorization to access endpoint.
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "message": "You must be an administrator to use this endpoint."
 *    }
 *
 * @apiError (401 Unauthorized) { String } message The error message.
 *
 * @apiErrorExample Invalid JSON Web Token.
 *    HTTP/1.1 401 Unauthorized
 *    {
 *      "message": "Invalid token."
 *    }
 *
 * @apiError (400 Bad Request) { String }   message         The error message.
 * @apiError (400 Bad Request) { Object[] } errors          Errors in the request parameters.
 * @apiError (400 Bad Request) { String }   errors.msg      Message of the parameter error.
 * @apiError (400 Bad Request) { String }   errors.param    Name of the parameter that caused the error.
 * @apiError (400 Bad Request) { String }   errors.location Location of the parameter that caused the error.
 * @apiError (400 Bad Request) { any }      [errors.value]  Value of the parameter that caused the error.
 *
 * @apiErrorExample Invalid request parameters.
 *    HTTP/1.1 400 Bad Request
 *    {
 *      "message": "Invalid request parameters.",
 *      "errors": [
 *        {
 *          "value": "1",
 *          "msg": "Invalid value",
 *          "param": "range",
 *          "location": "query"
 *        }
 *      ]
 *    }
 */
usersRouter.get(
  '/users',
  [
    Validators.authToken,
    Validators.range,
    Validators.getSort(['id', 'email', 'password', 'role']),
    Validators.getSearch(['id', 'email', 'password', 'role']),
  ],
  paramsValidatorMiddleware,
  authMiddleware,
  adminMiddleware,
  asyncWraper(usersController.getUsers),
);

/**
 * @api { post } /users Create a new User.
 * @apiName CreateUser
 * @apiGroup Users
 *
 * @apiParam (Body Parameters) { String } email    The email of the User.
 * @apiParam (Body Parameters) { String } password The password of the User.
 * @apiParam (Body Parameters) { String } role     The role of the User.
 *
 * @apiSuccess (201 Created) { String } id       The ID of the created User.
 * @apiSuccess (201 Created) { String } email    The email of the created User.
 * @apiSuccess (201 Created) { String } password The encrypted password of the created User.
 * @apiSuccess (201 Created) { String } role     The role of the created User, either "ADMIN" or "USER".
 *
 * @apiSuccessExample Success Response
 *    HTTP/1.1 201 Created
 *    {
 *      "id": "d052f9c8-1734-4fa4-810c-c5836582daf7",
 *      "email": "john.doe@mail.com",
 *      "password": "$2b$10$rZIqIwmUmdOB12ECEinywu6UsH0HW06YwbeVX9T0yQBnHWWDKor6m",
 *      "role": "USER"
 *    }
 *
 * @apiError (409 Conflict) { String } message The error message.
 *
 * @apiErrorExample Email already exists.
 *    HTTP/1.1 409 Conflict
 *    {
 *      "message": "Email already exists."
 *    }
 *
 * @apiError (403 Forbidden) { String } message The error message.
 *
 * @apiErrorExample Insufficient authorization to access endpoint.
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "message": "You must be an administrator to use this endpoint."
 *    }
 *
 * @apiError (401 Unauthorized) { String } message The error message.
 *
 * @apiErrorExample Invalid JSON Web Token.
 *    HTTP/1.1 401 Unauthorized
 *    {
 *      "message": "Invalid token."
 *    }
 *
 * @apiError (400 Bad Request) { String }   message         The error message.
 * @apiError (400 Bad Request) { Object[] } errors          Errors in the request parameters.
 * @apiError (400 Bad Request) { String }   errors.msg      Message of the parameter error.
 * @apiError (400 Bad Request) { String }   errors.param    Name of the parameter that caused the error.
 * @apiError (400 Bad Request) { String }   errors.location Location of the parameter that caused the error.
 * @apiError (400 Bad Request) { any }      [errors.value]  Value of the parameter that caused the error.
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
  [
    Validators.authToken,
    body('email').isEmail(),
    body('password').isString().isLength({ min: 8, max: 30 }),
    body('role').isString().isIn(USER_ROLES),
  ],
  paramsValidatorMiddleware,
  authMiddleware,
  adminMiddleware,
  asyncWraper(usersController.createUser),
);

/**
 * @api { get } /users/:userId Get a User information.
 * @apiName GetUser
 * @apiGroup Users
 *
 * @apiParam (URL Parameters) { String } userId The ID of the User.
 *
 * @apiSuccess (200 OK) { String } id       The ID of the User.
 * @apiSuccess (200 OK) { String } email    The email of the User.
 * @apiSuccess (200 OK) { String } password The encrypted password of the User.
 * @apiSuccess (200 OK) { String } role     The role of the User, either "ADMIN" or "USER".
 *
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      "id": "d052f9c8-1734-4fa4-810c-c5836582daf7",
 *      "email": "john.doe@mail.com",
 *      "password": "$2b$10$rZIqIwmUmdOB12ECEinywu6UsH0HW06YwbeVX9T0yQBnHWWDKor6m",
 *      "role": "USER"
 *    }
 *
 * @apiError (404 Not Found) { String } message The error message.
 *
 * @apiErrorExample User ID not found.
 *    HTTP/1.1 404 Not Found
 *    {
 *      "message": "User ID not found."
 *    }
 *
 * @apiError (403 Forbidden) { String } message The error message.
 *
 * @apiErrorExample Insufficient authorization to get User info.
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "message": "Users without administrator rights can only get their own user info."
 *    }
 *
 * @apiError (401 Unauthorized) { String } message The error message.
 *
 * @apiErrorExample Invalid JSON Web Token.
 *    HTTP/1.1 401 Unauthorized
 *    {
 *      "message": "Invalid token."
 *    }
 *
 * @apiError (400 Bad Request) { String }   message         The error message.
 * @apiError (400 Bad Request) { Object[] } errors          Errors in the request parameters.
 * @apiError (400 Bad Request) { String }   errors.msg      Message of the parameter error.
 * @apiError (400 Bad Request) { String }   errors.param    Name of the parameter that caused the error.
 * @apiError (400 Bad Request) { String }   errors.location Location of the parameter that caused the error.
 * @apiError (400 Bad Request) { any }      [errors.value]  Value of the parameter that caused the error.
 *
 * @apiErrorExample Invalid request parameters.
 *    HTTP/1.1 400 Bad Request
 *    {
 *      "message": "Invalid request parameters.",
 *      "errors": [
 *        {
 *          "value": "aaa",
 *          "msg": "Invalid value",
 *          "param": "userId",
 *          "location": "params"
 *        }
 *      ]
 *    }
 *
 */
usersRouter.get(
  '/users/:userId',
  [Validators.authToken, param('userId').isUUID(4)],
  paramsValidatorMiddleware,
  authMiddleware,
  asyncWraper(usersController.getUser),
);

/**
 * @api { patch } /users/:userId Update a User information.
 * @apiName UpdateUser
 * @apiGroup Users
 *
 * @apiParam (URL Parameters) { String } userId The ID of the User to update.
 *
 * @apiParam (Body Parameters) { String } [email]    The new email of the User.
 * @apiParam (Body Parameters) { String } [password] The new password of the User.
 * @apiParam (Body Parameters) { String } [role]     The new role of the User.
 *
 * @apiSuccess (200 OK) { String } id       The ID of the updated User.
 * @apiSuccess (200 OK) { String } email    The email of the updated User.
 * @apiSuccess (200 OK) { String } password The encrypted password of the updated User.
 * @apiSuccess (200 OK) { String } role     The role of the updated User, either "ADMIN" or "USER".
 *
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      "id": "d052f9c8-1734-4fa4-810c-c5836582daf7",
 *      "email": "john.doe@mail.com",
 *      "password": "$2b$10$rZIqIwmUmdOB12ECEinywu6UsH0HW06YwbeVX9T0yQBnHWWDKor6m",
 *      "role": "USER"
 *    }
 *
 * @apiError (404 Not Found) { String } message The error message.
 *
 * @apiErrorExample User ID not found.
 *    HTTP/1.1 404 Not Found
 *    {
 *      "message": "User ID not found."
 *    }
 *
 * @apiError (403 Forbidden) { String } message The error message.
 *
 * @apiErrorExample Insufficient authorization to update role.
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "message": "Users can not set themselves as administrator."
 *    }
 *
 * @apiErrorExample Insufficient authorization to update User.
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "message": "Users without administrator rights can only update their own user info."
 *    }
 *
 * @apiError (401 Unauthorized) { String } message The error message.
 *
 * @apiErrorExample Invalid JSON Web Token.
 *    HTTP/1.1 401 Unauthorized
 *    {
 *      "message": "Invalid token."
 *    }
 *
 * @apiError (400 Bad Request) { String }   message         The error message.
 * @apiError (400 Bad Request) { Object[] } errors          Errors in the request parameters.
 * @apiError (400 Bad Request) { String }   errors.msg      Message of the parameter error.
 * @apiError (400 Bad Request) { String }   errors.param    Name of the parameter that caused the error.
 * @apiError (400 Bad Request) { String }   errors.location Location of the parameter that caused the error.
 * @apiError (400 Bad Request) { any }      [errors.value]  Value of the parameter that caused the error.
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
usersRouter.patch(
  '/users/:userId',
  [
    Validators.authToken,
    param('userId').isUUID(4),
    body('email').optional().isEmail(),
    body('password').optional().isString().isLength({ min: 8, max: 30 }),
    body('role').optional().isString().isIn(USER_ROLES),
  ],
  paramsValidatorMiddleware,
  authMiddleware,
  asyncWraper(usersController.updateUser),
);

/**
 * @api { delete } /users/:userId Delete a User.
 * @apiName DeleteUser
 * @apiGroup Users
 *
 * @apiParam (URL Parameters) { String } userId The ID of the User to delete.
 *
 * @apiSuccess (200 OK) { String } message  The message response.
 * @apiSuccess (200 OK) { String } affected The number of deleted Users (should always be equal to 1).
 *
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      "message": "User successfully deleted."",
 *      "affected": 1,
 *    }
 *
 * @apiError (404 Not Found) { String } message The error message.
 *
 * @apiErrorExample User ID not found.
 *    HTTP/1.1 404 Not Found
 *    {
 *      "message": "User ID not found."
 *    }
 *
 * @apiError (403 Forbidden) { String } message The error message.
 *
 * @apiErrorExample Insufficient authorization to access endpoint.
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "message": "You must be an administrator to use this endpoint."
 *    }
 *
 * @apiError (401 Unauthorized) { String } message The error message.
 *
 * @apiErrorExample Invalid JSON Web Token.
 *    HTTP/1.1 401 Unauthorized
 *    {
 *      "message": "Invalid token."
 *    }
 *
 * @apiError (400 Bad Request) { String }   message         The error message.
 * @apiError (400 Bad Request) { Object[] } errors          Errors in the request parameters.
 * @apiError (400 Bad Request) { String }   errors.msg      Message of the parameter error.
 * @apiError (400 Bad Request) { String }   errors.param    Name of the parameter that caused the error.
 * @apiError (400 Bad Request) { String }   errors.location Location of the parameter that caused the error.
 * @apiError (400 Bad Request) { any }      [errors.value]  Value of the parameter that caused the error.
 *
 * @apiErrorExample Invalid request parameters.
 *    HTTP/1.1 400 Bad Request
 *    {
 *      "message": "Invalid request parameters.",
 *      "errors": [
 *        {
 *          "value": "aaa",
 *          "msg": "Invalid value",
 *          "param": "userId",
 *          "location": "params"
 *        }
 *      ]
 *    }
 *
 */
usersRouter.delete(
  '/users/:userId',
  [Validators.authToken, param('userId').isUUID(4)],
  paramsValidatorMiddleware,
  authMiddleware,
  adminMiddleware,
  asyncWraper(usersController.deleteUser),
);

export default usersRouter;
