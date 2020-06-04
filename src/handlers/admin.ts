import { APIGatewayProxyHandler } from "aws-lambda";
import { scheduledBingoCardCreation } from "../clients/dynamo-admin.client";

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
