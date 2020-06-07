import {
  APIGatewayProxyHandler,
  CognitoUserPoolEvent,
  CognitoUserPoolTriggerEvent,
} from "aws-lambda";
import { scheduledBingoCardCreation } from "../clients/dynamo-admin.client";
import { CognitoEventType } from "aws-sdk/clients/cognitosync";
import { addNewUser } from "../clients/dynamo-users.client";

export const scheduleFiveDayBingoCards: APIGatewayProxyHandler = async () => {
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
