"use strict";

import {
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda/trigger/api-gateway-proxy";
import { isDefined } from "../common/support";
import {
  addNewUser,
  addFriendIDToUser,
  getUsers,
} from "../clients/dynamo-users.client";

// POST
// BODY PARAMS:
// userIDs REQUIRED
export const getFriends: APIGatewayProxyHandler = async (event) => {
  let result: APIGatewayProxyResult;
  const body = JSON.parse(event.body);
  if (!isDefined(body.userIDs)) {
    return { statusCode: 500, body: "No body param: userIDs" };
  }
  await getUsers(body.userIDs).then(
    (success): void => {
      result = success;
    },
    (error) => {
      result = error;
    }
  );

  return result;
};

// POST
// BODY PARAMS:
// _id REQUIRED
export const addFriend: APIGatewayProxyHandler = async (event) => {
  let result: APIGatewayProxyResult;
  const claimedUserName = event.requestContext.authorizer.principalId;
  const body = JSON.parse(event.body);

  if (!isDefined(body.friendID)) {
    return { statusCode: 500, body: "No body param: _id" };
  }
  if (!isDefined(body.currentID)) {
    return { statusCode: 500, body: "No body param: _id" };
  }
  await addFriendIDToUser(claimedUserName, body._id).then(
    (success): void => {
      result = success;
    },
    (err) => {
      result = err;
    }
  );

  return result;
};

export const registerUser: APIGatewayProxyHandler = async (event) => {
  let result: APIGatewayProxyResult;
  const body = JSON.parse(event.body);
  const claimedUserName = event.requestContext.authorizer.principalId;
  const claimedID = event.requestContext.authorizer.claims.sub;
  if (!isDefined(body.email)) {
    result = { statusCode: 500, body: "No body param: email" };
  }

  await addNewUser(claimedID, claimedUserName, body.email).then(
    (value): void => {
      result = value as APIGatewayProxyResult;
    },
    (err) => {
      result = err;
    }
  );
  return result;
};
