"use strict";

// // Importing functions results in undefined, something to do with webpack
// const isAuthValid = require("../common/isAuthValid");
// const mongoDB = require();
import { usersCollection } from "../types/mongo.type";
import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { isAuthValid } from "../common/isAuthValid";
import { findCurrentUser } from "../clients/mongo.client";
import { isDefined } from "../common/support";
import { findUsers } from "../clients/dynamo.client";

export const getCurrentUser: APIGatewayProxyHandler = async (
  event,
  context
) => {
  let response: APIGatewayProxyResult;
  context.callbackWaitsForEmptyEventLoop = false;
  await isAuthValid(event.headers.Authorization).then(
    async (claim): Promise<void> => {
      if (claim.isValid) {
        await findCurrentUser(claim.userName).then(
          (collection: usersCollection) => {
            response = {
              statusCode: 200,
              body: JSON.stringify(collection),
            };
          }
        );
      } else {
        response = { statusCode: 500, body: "NOT AUTHORIZED" };
      }
    }
  );
  return response;
};

export const searchUsers: APIGatewayProxyHandler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let result: APIGatewayProxyResult;
  await isAuthValid(event.headers.Authorization).then(
    async (claim): Promise<void> => {
      if (claim.isValid) {
        if (!isDefined(event.queryStringParameters.search)) {
          result = { statusCode: 500, body: "No query param: search" };
        }
        await findUsers(event.queryStringParameters.search).then(
          (response): void => {
            result = response;
          },
          (err) => {
            result = err;
          }
        );
      } else {
        result = { statusCode: 401, body: "Invalid token" };
      }
    }
  );
  return result;
};
