import { Router } from 'express';
import { body, param } from 'express-validator';
import { categoriesController } from '../controllers';
import { paramsValidatorMiddleware, authMiddleware, Validators, asyncWraper } from '../middleware';

const categoriesRouter = Router();

/**
 * @api { get } /categories Get all Categories of a given user.
 * @apiName GetCategories
 * @apiGroup Categories
 *
 * @apiParam (Query Parameters) { int[] }    [range]  Range for pagination. Ex : [3, 15] to get values from index 3 to 15.
 * @apiParam (Query Parameters) { String[] } [sort]   Sort for the results in the format : [field, order]. Order are either "ASC" or "DESC". Fields can be the following : "id", "name" or "matchAll".
 * @apiParam (Query Parameters) { String[] } [search] Filter results by searching keywords in fields with the format : [field, "keyword"]. Fields can be the following : "id", "name" or "matchAll".
 *
 * @apiSuccess (200 OK) { Category[] } values                     Array of Categories matching the query.
 * @apiSuccess (200 OK) { String }     values.id                  The ID of the Category (uuid v4).
 * @apiSuccess (200 OK) { String }     values.userId              The ID of the Category's User (uuid v4).
 * @apiSuccess (200 OK) { String }     values.name                The name of the Category.
 * @apiSuccess (200 OK) { Boolean }    values.matchAll            The matchAll option of the Category.
 * @apiSuccess (200 OK) { Keyword[] }  values.keywords            Array of Keywords of the Category.
 * @apiSuccess (200 OK) { String }     values.keywords.id         The ID of the Keyword.
 * @apiSuccess (200 OK) { String }     values.keywords.categoryId The ID of the Keyword's Category (uuid v4).
 * @apiSuccess (200 OK) { String }     values.keywords.value      The value of the Keyword.
 *
 * @apiSuccessExample Success Response:
 *    HTTP/1.1 200 OK
 *    [
 *      {
 *        "values" : [
 *          {
 *            "id": "d052f9c8-1734-4fa4-810c-c5836582daf7",
 *            "userId":"045a15d7-81c3-46b3-a627-f6015f507251",
 *            "name": "Video Games",
 *            "matchAll": false,
 *            "keywords": [
 *              {
 *                "id": "df852dda-2924-47b1-ba1f-0704fa36db4a",
 *                "categoryId":"d052f9c8-1734-4fa4-810c-c5836582daf7",
 *                "value": "NINTENDO"
 *              },
 *              ...
 *            ]
 *          },
 *          ...
 *        ]
 *    ]
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
 *          "value": "a",
 *          "msg": "Invalid value",
 *          "param": "sort",
 *          "location": "query"
 *        }
 *      ]
 *    }
 */
categoriesRouter.get(
  '/categories',
  [
    Validators.authToken,
    Validators.range,
    Validators.getSort(['id', 'name', 'matchAll']),
    Validators.getSearch(['id', 'name', 'matchAll']),
  ],
  paramsValidatorMiddleware,
  authMiddleware,
  asyncWraper(categoriesController.getCategories),
);

/**
 * @api { post } /categories Create a new Category.
 * @apiName CreateCategory
 * @apiGroup Categories
 *
 * @apiParam (Body Parameters) { Boolean } matchAll The matchAll option of the Category.
 * @apiParam (Body Parameters) { String }  name     The name of the Category.
 *
 * @apiSuccess (201 Created) { String }  id       The ID of the created Category (uuid v4).
 * @apiSuccess (201 Created) { String }  name     The name of the created Category.
 * @apiSuccess (201 Created) { String }  userId   The ID of the Category's User.
 * @apiSuccess (201 Created) { Boolean } matchAll The matchAll option of the created Category.
 *
 * @apiSuccessExample Success Response
 *    HTTP/1.1 201 Created
 *    {
 *      "id": "d052f9c8-1734-4fa4-810c-c5836582daf7",
 *      "userId": "26f065ed-a6b8-45eb-bd08-2a57c1e94018",
 *      "name": "Video Games",
 *      "matchAll": false
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
 *          "value": "a",
 *          "msg": "Invalid value",
 *          "param": "matchAll",
 *          "location": "body"
 *        }
 *      ]
 *    }
 *
 */
categoriesRouter.post(
  '/categories',
  [
    Validators.authToken,
    body('matchAll').isBoolean(),
    body('name').isString().isLength({ min: 1, max: 255 }),
  ],
  paramsValidatorMiddleware,
  authMiddleware,
  asyncWraper(categoriesController.createCategory),
);

/**
 * @api { get } /categories/:categoryId Get a Category's information.
 * @apiName GetCategory
 * @apiGroup Categories
 *
 * @apiParam (URL Parameters) { String } categoryId The ID of the Category (uuid v4).
 *
 * @apiSuccess (200 OK) { String }     id                  The ID of the Category (uuid v4).
 * @apiSuccess (200 OK) { String }     userId              The ID of the Category's User (uuid v4).
 * @apiSuccess (200 OK) { String }     name                The name of the Category.
 * @apiSuccess (200 OK) { Boolean }    matchAll            The matchAll option of the Category.
 * @apiSuccess (200 OK) { Keyword[] }  keywords            Array of Keywords of the Category.
 * @apiSuccess (200 OK) { String }     keywords.id         The ID of the Keyword.
 * @apiSuccess (200 OK) { String }     keywords.categoryId The ID of the Keyword's Category (uuid v4).
 * @apiSuccess (200 OK) { String }     keywords.value      The value of the Keyword.
 *
 * @apiSuccessExample Success Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "id": "d052f9c8-1734-4fa4-810c-c5836582daf7",
 *      "userId":"045a15d7-81c3-46b3-a627-f6015f507251",
 *      "name": "Video Games",
 *      "matchAll": false,
 *      "keywords": [
 *        {
 *          "id": "df852dda-2924-47b1-ba1f-0704fa36db4a",
 *          "categoryId":"d052f9c8-1734-4fa4-810c-c5836582daf7",
 *          "value": "NINTENDO"
 *        },
 *        ...
 *      ]
 *    }
 *
 * @apiError (404 Not Found) { String } message The error message.
 *
 * @apiErrorExample Category ID not found.
 *    HTTP/1.1 404 Not Found
 *    {
 *      "message": "Category ID not found."
 *    }
 *
 * @apiError (403 Forbidden) { String } message The error message.
 *
 * @apiErrorExample Invalid ownership for this Category.
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "message": "You do not have the rights to access this category."
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
 *          "value": "a",
 *          "msg": "Invalid value",
 *          "param": "categoryId",
 *          "location": "params"
 *        }
 *      ]
 *    }
 *
 */
categoriesRouter.get(
  '/categories/:categoryId',
  [Validators.authToken, param('categoryId').isUUID(4)],
  paramsValidatorMiddleware,
  authMiddleware,
  asyncWraper(categoriesController.getCategory),
);

/**
 * @api { patch } /categories/:categoryId Update a Category's information.
 * @apiName UpdateCategory
 * @apiGroup Categories
 *
 * @apiParam (URL Parameters) { String } categoryId The ID of the Category to update (uuid v4).
 *
 * @apiParam (Body Parameters) { String }    [name]         The new name of the Category.
 * @apiParam (Body Parameters) { Boolean }   [matchAll]     The new matchAll option of the Category.
 * @apiParam (Body Parameters) { Keyword[] } [keywords]     New Keywords of the Category.
 * @apiParam (Body Parameters) { String }    [keywords.id]  The ID of the Keyword. If you do not specify a Keyword ID, a new one will be created.
 * @apiParam (Body Parameters) { String }    keywords.value The value of the Keyword.
 *
 * @apiSuccess (200 OK) { String }     id                  The ID of the updated Category (uuid v4).
 * @apiSuccess (200 OK) { String }     userId              The ID of the updated Category's User (uuid v4).
 * @apiSuccess (200 OK) { String }     name                The name of the updated Category.
 * @apiSuccess (200 OK) { Boolean }    matchAll            The matchAll option of the updated Category.
 * @apiSuccess (200 OK) { Keyword[] }  keywords            Array of Keywords of the updated Category.
 * @apiSuccess (200 OK) { String }     keywords.id         The ID of the Keyword.
 * @apiSuccess (200 OK) { String }     keywords.categoryId The ID of the Keyword's Category (uuid v4).
 * @apiSuccess (200 OK) { String }     keywords.value      The value of the Keyword.
 *
 * @apiSuccessExample Success Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "id": "d052f9c8-1734-4fa4-810c-c5836582daf7",
 *      "userId":"045a15d7-81c3-46b3-a627-f6015f507251",
 *      "name": "Video Games",
 *      "matchAll": false,
 *      "keywords": [
 *        {
 *          "id": "df852dda-2924-47b1-ba1f-0704fa36db4a",
 *          "categoryId":"d052f9c8-1734-4fa4-810c-c5836582daf7",
 *          "value": "NINTENDO"
 *        },
 *        ...
 *      ]
 *    }
 *
 * @apiError (404 Not Found) { String } message The error message.
 *
 * @apiErrorExample Keyword ID not found.
 *    HTTP/1.1 404 Not Found
 *    {
 *      "message": "Keyword ID not found. Do not specify the keyword ID if you want to create a new one."
 *    }
 *
 * @apiErrorExample Category ID not found.
 *    HTTP/1.1 404 Not Found
 *    {
 *      "message": "Category ID not found."
 *    }
 *
 * @apiError (403 Forbidden) { String } message The error message.
 *
 * @apiErrorExample Invalid ownership for this Category.
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "message": "You do not have the rights to update this category."
 *    }
 *
 * @apiErrorExample Invalid ownership for a Keyword.
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "message": "You are not the owner of the keyword you are trying to add to the category."
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
 *          "value": "",
 *          "msg": "Invalid value",
 *          "param": "name",
 *          "location": "body"
 *        }
 *      ]
 *    }
 *
 */
categoriesRouter.patch(
  '/categories/:categoryId',
  [
    Validators.authToken,
    param('categoryId').isUUID(4),
    body('name').optional().isString().isLength({ min: 1, max: 255 }),
    body('matchAll').optional().isBoolean(),
    Validators.keywords,
  ],
  paramsValidatorMiddleware,
  authMiddleware,
  asyncWraper(categoriesController.updateCategory),
);

/**
 * @api { delete } /categories/:categoryId Delete a Category.
 * @apiName DeleteCategory
 * @apiGroup Categories
 *
 * @apiParam (URL Parameters) { String } categoryId The ID of the Category to delete (uuid v4).
 *
 * @apiSuccess (200 OK) { String } message  The message response.
 * @apiSuccess (200 OK) { String } affected The number of deleted Categories (should always be equal to 1).
 *
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      "message": "Category successfully deleted.",
 *      "affected": 1,
 *    }
 *
 * @apiError (404 Not Found) { String } message The error message.
 *
 * @apiErrorExample Category ID not found.
 *    HTTP/1.1 404 Not Found
 *    {
 *      "message": "Category ID not found."
 *    }
 *
 * @apiError (403 Forbidden) { String } message The error message.
 *
 * @apiErrorExample Invalid ownership for this Category.
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "message": "You do not have the rights to delete this category."
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
 *          "value": "a",
 *          "msg": "Invalid value",
 *          "param": "categoryId",
 *          "location": "params"
 *        }
 *      ]
 *    }
 *
 */
categoriesRouter.delete(
  '/categories/:categoryId',
  [Validators.authToken, param('categoryId').isUUID(4)],
  paramsValidatorMiddleware,
  authMiddleware,
  asyncWraper(categoriesController.deleteCategory),
);

export default categoriesRouter;
