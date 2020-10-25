import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { keywordsController } from '../controllers';
import { paramsValidatorMiddleware, authMiddleware, Validators, asyncWraper } from '../middleware';

const keywordsRouter = Router();

/**
 * @apiDeprecated The Keywords API should no longer be used. Use the Categories API instead.
 * @api { get } /keywords Get all Keywords of a given category.
 * @apiName GetKeywords
 * @apiGroup Keywords [DEPRECATED]
 * @apiDescription **- The Keywords API should no longer be used. Use the Categories API instead. -**
 *
 * @apiParam (Query Parameters) { String }   categoryId The ID of the category (uuid v4).
 * @apiParam (Query Parameters) { int[] }    [range]    Range for pagination. Ex : [3, 15] to get values from index 3 to 15.
 * @apiParam (Query Parameters) { String[] } [sort]     Sort for the results in the format : [field, order]. Order are either "ASC" or "DESC". Fields can be the following : "value" or "id".
 * @apiParam (Query Parameters) { String[] } [search]   Filter results by searching keywords in fields with the format : [field, "keyword"]. Fields can be the following : "value" or "id".
 *
 * @apiSuccess (200 OK) { Keyword[] } values            Array of Keywords matching the query.
 * @apiSuccess (200 OK) { String }    values.id         The id of the Keyword (uuid v4).
 * @apiSuccess (200 OK) { String }    values.value      The value of the Keyword.
 * @apiSuccess (200 OK) { int }       values.categoryId The ID of the Keyword's associated category.
 *
 * @apiSuccessExample Success Response:
 *    HTTP/1.1 200 OK
 *    [
 *      {
 *        "values" : [
 *          {
 *            "id": "d052f9c8-1734-4fa4-810c-c5836582daf7",
 *            "value": "Uber EATS",
 *            "categoryId": "468"
 *          },
 *          ...
 *        ]
 *    ]
 *
 * @apiError (404 Not Found) { String } message The error message.
 *
 * @apiErrorExample Category ID not found.
 *    HTTP/1.1 404 Not Found
 *    {
 *      "message": "Unknown category ID."
 *    }
 *
 * @apiError (403 Forbidden) { String } message The error message.
 *
 * @apiErrorExample Invalid ownership for this category.
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "message": "You do not have the rights to access the keywords of this category."
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
 *          "location": "query"
 *        }
 *      ]
 *    }
 */
keywordsRouter.get(
  '/keywords',
  [
    Validators.authToken,
    Validators.range,
    query('categoryId').isUUID(4),
    Validators.getSort(['id', 'value']),
    Validators.getSearch(['id', 'value']),
  ],
  paramsValidatorMiddleware,
  authMiddleware,
  asyncWraper(keywordsController.getKeywords),
);

/**
 * @apiDeprecated The Keywords API should no longer be used. Use the Categories API instead.
 * @api { post } /keywords Create a new Keyword.
 * @apiName CreateKeyword
 * @apiGroup Keywords [DEPRECATED]
 * @apiDescription **- The Keywords API should no longer be used. Use the Categories API instead. -**
 *
 * @apiParam (Body Parameters) { String } categoryId The category associated with the Keyword (uuid v4).
 * @apiParam (Body Parameters) { String } value      The value of the Keyword.
 *
 * @apiSuccess (201 Created) { String } id      The ID of the created Keyword (uuid v4).
 * @apiSuccess (201 Created) { String } value   The value of the created Keyword.
 * @apiSuccess (201 Created) { int } categoryId The ID of the Keyword's Category.
 *
 * @apiSuccessExample Success Response
 *    HTTP/1.1 201 Created
 *    {
 *      "id": "d052f9c8-1734-4fa4-810c-c5836582daf7",
 *      "value": "Uber EATS",
 *      "categoryId": "6f88c6f0-98f8-4600-b3c4-c7aeb630148f"
 *    }
 *
 * @apiError (404 Not Found) { String } message The error message.
 *
 * @apiErrorExample Category ID not found.
 *    HTTP/1.1 404 Not Found
 *    {
 *      "message": "Unknown category ID."
 *    }
 *
 * @apiError (403 Forbidden) { String } message The error message.
 *
 * @apiErrorExample Invalid ownership for this category.
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "message": "You do not have the rights to add a keyword to this category."
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
 *          "location": "body"
 *        }
 *      ]
 *    }
 *
 */
keywordsRouter.post(
  '/keywords',
  [
    Validators.authToken,
    body('categoryId').isUUID(4),
    body('value').isString().isLength({ min: 1, max: 255 }),
  ],
  paramsValidatorMiddleware,
  authMiddleware,
  asyncWraper(keywordsController.createKeyword),
);

/**
 * @apiDeprecated The Keywords API should no longer be used. Use the Categories API instead.
 * @api { get } /keywords/:keywordId Get a Keyword's information.
 * @apiName GetKeyword
 * @apiGroup Keywords [DEPRECATED]
 * @apiDescription **- The Keywords API should no longer be used. Use the Categories API instead. -**
 *
 * @apiParam (URL Parameters) { String } keywordId The ID of the Keyword (uuid v4).
 *
 * @apiSuccess (200 OK) { String } id         The ID of the Keyword (uuid v4).
 * @apiSuccess (200 OK) { String } categoryId The ID of the Keyword's category (uuid v4).
 * @apiSuccess (200 OK) { String } value      The value of the Keyword.
 *
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      "id": "d052f9c8-1734-4fa4-810c-c5836582daf7",
 *      "value": "Uber EATS",
 *      "categoryId": "6f88c6f0-98f8-4600-b3c4-c7aeb630148f"
 *    }
 *
 * @apiError (404 Not Found) { String } message The error message.
 *
 * @apiErrorExample Keyword ID not found.
 *    HTTP/1.1 404 Not Found
 *    {
 *      "message": "Keyword ID not found."
 *    }
 *
 * @apiError (403 Forbidden) { String } message The error message.
 *
 * @apiErrorExample Invalid ownership for this Keyword.
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "message": "You do not have the rights to access this keyword."
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
 *          "param": "keywordId",
 *          "location": "params"
 *        }
 *      ]
 *    }
 *
 */
keywordsRouter.get(
  '/keywords/:keywordId',
  [Validators.authToken, param('keywordId').isUUID(4)],
  paramsValidatorMiddleware,
  authMiddleware,
  asyncWraper(keywordsController.getKeyword),
);

/**
 * @apiDeprecated The Keywords API should no longer be used. Use the Categories API instead.
 * @api { patch } /keywords/:keywordId Update a Keyword's information.
 * @apiName UpdateKeyword
 * @apiGroup Keywords [DEPRECATED]
 * @apiDescription **- The Keywords API should no longer be used. Use the Categories API instead. -**
 *
 * @apiParam (URL Parameters) { String } keywordId The ID of the Keyword to update (uuid v4).
 *
 * @apiParam (Body Parameters) { String } value The new value of the Keyword.
 *
 * @apiSuccess (200 OK) { String } id         The ID of the updated Keyword (uuid v4).
 * @apiSuccess (200 OK) { String } value      The value of the updated Keyword.
 * @apiSuccess (200 OK) { String } categoryId The ID of the updated Keyword's category (uuid v4).
 *
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      "id": "d052f9c8-1734-4fa4-810c-c5836582daf7",
 *      "value": "Uber EATS",
 *      "categoryId": "6f88c6f0-98f8-4600-b3c4-c7aeb630148f"
 *    }
 *
 * @apiError (404 Not Found) { String } message The error message.
 *
 * @apiErrorExample Keyword ID not found.
 *    HTTP/1.1 404 Not Found
 *    {
 *      "message": "Keyword ID not found."
 *    }
 *
 * @apiError (403 Forbidden) { String } message The error message.
 *
 * @apiErrorExample Invalid ownership for this Keyword.
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "message": "You do not have the rights to update this keyword."
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
 *          "param": "value",
 *          "location": "body"
 *        }
 *      ]
 *    }
 *
 */
keywordsRouter.patch(
  '/keywords/:keywordId',
  [
    Validators.authToken,
    param('keywordId').isUUID(4),
    body('value').isString().isLength({ min: 1, max: 255 }),
  ],
  paramsValidatorMiddleware,
  authMiddleware,
  asyncWraper(keywordsController.updateKeyword),
);

/**
 * @apiDeprecated The Keywords API should no longer be used. Use the Categories API instead.
 * @api { delete } /keywords/:keywordId Delete a Keyword.
 * @apiName DeleteKeyword
 * @apiGroup Keywords [DEPRECATED]
 * @apiDescription **- The Keywords API should no longer be used. Use the Categories API instead. -**
 *
 * @apiParam (URL Parameters) { String } keywordId The ID of the Keyword to delete (uuid v4).
 *
 * @apiSuccess (200 OK) { String } message  The message response.
 * @apiSuccess (200 OK) { String } affected The number of deleted Keywords (should always be equal to 1).
 *
 * @apiSuccessExample Success Response
 *    HTTP/1.1 200 OK
 *    {
 *      "message": "Keyword successfully deleted.",
 *      "affected": 1,
 *    }
 *
 * @apiError (404 Not Found) { String } message The error message.
 *
 * @apiErrorExample Keyword ID not found.
 *    HTTP/1.1 404 Not Found
 *    {
 *      "message": "Keyword ID not found."
 *    }
 *
 * @apiError (403 Forbidden) { String } message The error message.
 *
 * @apiErrorExample Invalid ownership for this Keyword.
 *    HTTP/1.1 403 Forbidden
 *    {
 *      "message": "You do not have the rights to delete this keyword."
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
 *          "param": "keywordId",
 *          "location": "params"
 *        }
 *      ]
 *    }
 *
 */
keywordsRouter.delete(
  '/keywords/:keywordId',
  [Validators.authToken, param('keywordId').isUUID(4)],
  paramsValidatorMiddleware,
  authMiddleware,
  asyncWraper(keywordsController.deleteKeyword),
);

export default keywordsRouter;
