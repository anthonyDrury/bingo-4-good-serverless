"use strict";

import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { isDefined } from "../common/support";
import {
  findUsers,
  getUser,
  getUsers,
  isDisplayNameTaken,
} from "../clients/dynamo-users.client";
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

// POST
// BODY PARAMS:
// userIDs REQUIRED
export const getFriends: APIGatewayProxyHandler = async (event) => {
  const usernames =
    event.queryStringParameters &&
    event.queryStringParameters.usernames &&
    event.queryStringParameters.usernames.split(",");

  if (!isDefined(usernames) || !Array.isArray(usernames) || usernames === []) {
    return { statusCode: 500, body: "No query param: usernames" };
  }

  let result: APIGatewayProxyResult;
  await getUsers(usernames).then(
    (success) => {
      result = success;
    },
    (error) => {
      result = error;
    }
  );
  return result;
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
  const username = isDefined(event.queryStringParameters.username)
    ? event.queryStringParameters.username
    : event.requestContext.authorizer.principalId;

  await getAnswers(Number(event.queryStringParameters.date), username).then(
    (success) => {
      result = success;
    },
    (err) => {
      result = err;
    }
  );
  return result;
};

export const getIsDisplayNameTaken: APIGatewayProxyHandler = async (event) => {
  let result: APIGatewayProxyResult;

  if (!isDefined(event.queryStringParameters.search)) {
    result = { statusCode: 500, body: "No query param: search" };
  }

  await isDisplayNameTaken(event.queryStringParameters.search).then(
    (response): void => {
      result = response;
    },
    (err) => {
      result = err;
    }
  );

  return result;
};
