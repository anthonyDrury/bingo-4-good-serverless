"use strict";

import { APIGatewayTokenAuthorizerHandler } from "aws-lambda";
import { isAuthValid } from "../common/isAuthValid";

export const authorize: APIGatewayTokenAuthorizerHandler = (
  event,
  context,
  callback
) => {
  isAuthValid(event.authorizationToken).then(
    (claimResult) => {
      callback(null, {
        principalId: claimResult.userName,
        policyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Action: "execute-api:Invoke",
              Effect: claimResult.isValid ? "Allow" : "Deny",
              Resource: "*",
            },
          ],
        },
      });
    },
    () => {}
  );
};
