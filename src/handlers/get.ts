"use strict";

import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { isDefined } from "../common/support";
import { findUsers, getUser } from "../clients/dynamo-users.client";
import { getBingoCardFromTable } from "../clients/dynamo-bingo-card.client";
import { getAnswers } from "../clients/dynamo-bingo-answers.client";

export const getCurrentUser: APIGatewayProxyHandler = async (event) => {
  let response: APIGatewayProxyResult;
  const claimedUserName = event.requestContext.authorizer.principalId;
  await getUser(claimedUserName).then((success) => {
    response = success;
  });
  return response;
};

export const searchUsers: APIGatewayProxyHandler = async (event) => {
  let result: APIGatewayProxyResult;

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

  return result;
};

export const getBingoCard: APIGatewayProxyHandler = async (event) => {
  let result: APIGatewayProxyResult;
  if (!isDefined(event.queryStringParameters.date)) {
    result = { statusCode: 500, body: "No query param: date" };
  }
  await getBingoCardFromTable(Number(event.queryStringParameters.date)).then(
    (success) => {
      result = success;
    },
    (err) => {
      result = err;
    }
  );
  return result;
};

export const getBingoAnswers: APIGatewayProxyHandler = async (event) => {
  let result: APIGatewayProxyResult;
  if (!isDefined(event.queryStringParameters.date)) {
    result = { statusCode: 500, body: "No query param: date" };
  }
  const claimedUserName = event.requestContext.authorizer.principalId;
  await getAnswers(
    Number(event.queryStringParameters.date),
    claimedUserName
  ).then(
    (success) => {
      result = success;
    },
    (err) => {
      result = err;
    }
  );
  return result;
};
