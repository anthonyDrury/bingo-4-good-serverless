import {
  APIGatewayProxyHandler,
  CognitoUserPoolTriggerEvent,
} from "aws-lambda";
import { scheduledBingoCardCreation } from "../clients/dynamo-admin.client";
import { addNewUser } from "../clients/dynamo-users.client";
import { Callback, Context } from "aws-lambda";

export const scheduledFiveDayBingoCards: APIGatewayProxyHandler = async () => {
  return await scheduledBingoCardCreation().then(
    (value) => {
      return value;
    },
    (err) => {
      return err;
    }
  );
};

export const registerUser = async (
  event: CognitoUserPoolTriggerEvent,
  context,
  callback
) => {
  if (event.request.userAttributes.email) {
    await addNewUser(event.userName, event.request.userAttributes.email);
  } else {
    console.log("NO EMAIL FOUND");
  }
  callback(null, event);
};

export function autoConfirmUserCognitoPreSignUp(
  event: any,
  context: Context,
  callback: Callback
): void {
  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;
  callback(null, event);
}
