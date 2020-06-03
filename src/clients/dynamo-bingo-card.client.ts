import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyResult } from "aws-lambda";

const dynamoDb = new DynamoDB.DocumentClient();
const UsersTable = process.env.USERS_TABLE;

export async function getUser(_id: string) {
  const params: DynamoDB.DocumentClient.GetItemInput = {
    TableName: UsersTable,
    Key: {
      _id,
    },
  };

  return await new Promise(
    (
      resolve: (x: APIGatewayProxyResult) => void,
      reject: (err: APIGatewayProxyResult) => void
    ): void => {
      dynamoDb.get(params, (error, data) => {
        if (error) {
          reject({ statusCode: Number(error.code), body: error.message });
          return;
        }
        resolve({
          statusCode: 200,
          body: JSON.stringify(data),
        });
      });
    }
  ).then(
    (result) => {
      return result;
    },
    (err) => {
      return err;
    }
  );
}
