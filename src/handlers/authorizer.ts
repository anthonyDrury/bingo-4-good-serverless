"use strict";

import { APIGatewayTokenAuthorizerHandler } from "aws-lambda";
import { isAuthValid } from "../common/isAuthValid";
import { ClaimVerifyResult } from "../common/auth";

export const authorize: APIGatewayTokenAuthorizerHandler = async (
  event,
  context
) => {
  let claimResult: ClaimVerifyResult;

  await isAuthValid(event.authorizationToken).then(
    async (claim): Promise<void> => {
      claimResult = claim;
    }
  );

  if (claimResult.isValid) {
    return {
      principalId: claimResult.userName,
      policyDocument: {
        Version: Date.now().toString(),
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: claimResult.isValid ? "Allow" : "Deny",
            Resource: "*",
          },
        ],
        context: claimResult,
      },
    };
  }
};
