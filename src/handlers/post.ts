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
import { addAnswerToList } from "../clients/dynamo-bingo-answers.client";

// POST
// BODY PARAMS:
// userIDs REQUIRED
export const getFriends: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body);
  if (!isDefined(body.userIDs)) {
    return { statusCode: 500, body: "No body param: userIDs" };
  }
  await getUsers(body.userIDs).then(
    (success) => {
      return success;
    },
    (error) => {
      return error;
    }
  );
};

// POST
// BODY PARAMS:
// _id REQUIRED
export const addFriend: APIGatewayProxyHandler = async (event) => {
  const claimedUserName = event.requestContext.authorizer.principalId;
  const body = JSON.parse(event.body);

  if (!isDefined(body.friendID)) {
    return { statusCode: 500, body: "No body param: _id" };
  }
  if (!isDefined(body.currentID)) {
    return { statusCode: 500, body: "No body param: _id" };
  }
  await addFriendIDToUser(claimedUserName, body._id).then(
    (success) => {
      return success;
    },
    (err) => {
      return err;
    }
  );
};

export const registerUser: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body);
  const claimedUserName = event.requestContext.authorizer.principalId;
  const claimedID = event.requestContext.authorizer.claims.sub;
  if (!isDefined(body.email)) {
    return { statusCode: 500, body: "No body param: email" };
  }

  await addNewUser(claimedID, claimedUserName, body.email).then(
    (value) => {
      return value;
    },
    (err) => {
      return err;
    }
  );
};

export const answerItem: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body);
  const claimedID = event.requestContext.authorizer.claims.sub;
  if (!isDefined(body.date)) {
    return { statusCode: 500, body: "No body param: date" };
  }
  // TODO: Check validity of object structure
  if (!isDefined(body.answers)) {
    return { statusCode: 500, body: "No body param: answers" };
  }

  await addAnswerToList({
    cardDate: body.date,
    userID: claimedID,
    answers: body.answers,
  }).then(
    (value) => {
      return value;
    },
    (err) => {
      return err;
    }
  );
};
