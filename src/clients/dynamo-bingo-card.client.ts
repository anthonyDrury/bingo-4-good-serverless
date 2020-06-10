import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyResult } from "aws-lambda";

const dynamoDb = new DynamoDB.DocumentClient();
const BingoCardTable = process.env.BINGO_CARDS_TABLE;

export async function getBingoCardFromTable(date: number) {
  const params: DynamoDB.DocumentClient.GetItemInput = {
    TableName: BingoCardTable,
    Key: {
      dateUsed: date,
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
          body: JSON.stringify(data.Item),
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
