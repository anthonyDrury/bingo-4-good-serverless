"use strict";

import { shortUser } from "../types/API.types";
import {
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda/trigger/api-gateway-proxy";
import { isDefined } from "../common/support";
import { isAuthValid } from "../common/isAuthValid";
import {
  findUsers,
  getUsers,
  addFriendIDToUser,
} from "../clients/mongo.client";

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
          (users: shortUser[]): void => {
            result = { statusCode: 200, body: JSON.stringify(users) };
          }
        );
      } else {
        result = { statusCode: 401, body: "Invalid token" };
      }
    }
  );
  return result;
};

export const getFriends: APIGatewayProxyHandler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let result: APIGatewayProxyResult;
  await isAuthValid(event.headers.Authorization).then(
    async (claim): Promise<void> => {
      if (claim.isValid) {
        const body = JSON.parse(event.body);
        if (!isDefined(body.userIDs)) {
          result = { statusCode: 500, body: "No body param: userIDs" };
        }
        await getUsers(body.userIDs).then((users: shortUser[]): void => {
          result = { statusCode: 200, body: JSON.stringify(users) };
        });
      } else {
        result = { statusCode: 401, body: "Invalid token" };
      }
    }
  );
  return result;
};

export const addFriend: APIGatewayProxyHandler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let result: APIGatewayProxyResult;
  await isAuthValid(event.headers.Authorization).then(
    async (claim): Promise<void> => {
      if (claim.isValid) {
        const body = JSON.parse(event.body);
        if (!isDefined(body._id)) {
          result = { statusCode: 500, body: "No body param: _id" };
        }
        await addFriendIDToUser(claim.userName, body._id).then(
          (): void => {},
          (err) => {
            result = { statusCode: 500, body: `Error adding Friend - ${err}` };
          }
        );
      } else {
        result = { statusCode: 401, body: "Invalid token" };
      }
    }
  );
  return result;
};
