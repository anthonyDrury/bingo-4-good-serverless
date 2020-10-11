"use strict";

import {
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda/trigger/api-gateway-proxy";
import { isDefined } from "../common/support";
import {
  addFriendIDToUser,
  addDisplayNameToUser,
} from "../clients/dynamo-users.client";
import { updateAnswer } from "../clients/dynamo-bingo-answers.client";
import { bingoAnswersMap } from "../types/dynamo.type";

// POST
// BODY PARAMS:
// friendUsername REQUIRED
export const addFriend: APIGatewayProxyHandler = async (event) => {
  const claimedUserName = event.requestContext.authorizer.principalId;
  const body = JSON.parse(event.body);

  if (!isDefined(body.friendUsername)) {
    return { statusCode: 500, body: "No body param: friendUsername" };
  }
  return await addFriendIDToUser(claimedUserName, body.friendUsername).then(
    (success) => {
      return success;
    },
    (err) => {
      return err;
    }
  );
};

// For third party sign-in
// Need user friendly displayName
export const addDisplayName: APIGatewayProxyHandler = async (event) => {
  const claimedUserName = event.requestContext.authorizer.principalId;
  const body = JSON.parse(event.body);

  if (!isDefined(body.displayName)) {
    return { statusCode: 500, body: "No body param: displayName" };
  }
  return await addDisplayNameToUser(claimedUserName, body.displayName).then(
    (success) => {
      return success;
    },
    (err) => {
      return err;
    }
  );
};

export const answerItem: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body);
  const claimedUsername = event.requestContext.authorizer.principalId;
  if (!isDefined(body.date)) {
    return { statusCode: 500, body: "No body param: date" };
  }

  function isBodyValid(obj: Partial<bingoAnswersMap>) {
    if (
      !isDefined(obj.answer) ||
      !isDefined(obj.itemIndex) ||
      !isDefined(obj.position) ||
      !isDefined(obj.private) ||
      !isDefined(obj.statement)
    ) {
      return false;
    }
    return true;
  }

  // TODO: Check validity of object structure
  if (!isDefined(body.answers)) {
    return { statusCode: 500, body: "No body param: answers" };
  }

  const isParamValid = body.answers?.length
    ? (body.answers as []).map(isBodyValid).reduce((prev, curr) => prev && curr)
    : true;

  if (!isParamValid) {
    return { statusCode: 500, body: "Invalid param structure: answers" };
  }

  let result: APIGatewayProxyResult;
  await updateAnswer({
    cardDate: body.date,
    username: claimedUsername,
    answers: body.answers,
  }).then(
    (value) => {
      result = value;
    },
    (err) => {
      result = err;
    }
  );
  return result;
};
