"use strict";

import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { isDefined } from "../common/support";
import { findUsers, getUser } from "../clients/dynamo-users.client";
import { scheduledBingoCardCreation } from "../clients/dynamo-admin.client";

export const getCurrentUser: APIGatewayProxyHandler = async (event) => {
  let response: APIGatewayProxyResult;
  const claimedID = event.requestContext.authorizer.claims.sub;
  await getUser(claimedID).then((success) => {
    response = success;
  });
  return response;
};

export const searchUsers: APIGatewayProxyHandler = async (event) => {
  let result: APIGatewayProxyResult;

  if (!isDefined(event.queryStringParameters.search)) {
    result = { statusCode: 500, body: "No query param: search" };
  }

  await scheduledBingoCardCreation().then(
    // await findUsers(event.queryStringParameters.search).then(
    (response): void => {
      result = response;
    },
    (err) => {
      result = err;
    }
  );

  return result;
};
