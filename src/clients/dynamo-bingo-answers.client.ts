import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyResult } from "aws-lambda";
import { bingoAnswers } from "../types/dynamo.type";

const dynamoDb = new DynamoDB.DocumentClient();
const BingoAnswerTable = process.env.BINGO_ANSWERS_TABLE;

export async function updateAnswer(
  newAnswer: bingoAnswers
): Promise<APIGatewayProxyResult> {
  const params: DynamoDB.DocumentClient.PutItemInput = {
    TableName: BingoAnswerTable,
    Item: newAnswer,
  };

  return await new Promise(
    (
      resolve: (x: APIGatewayProxyResult) => void,
      reject: (err: APIGatewayProxyResult) => void
    ): void => {
      dynamoDb.put(params, (error, data) => {
        if (error) {
          reject({
            statusCode: Number(error.code),
            body: error.message,
          });
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

export async function getAnswers(
  date: number,
  username: string
): Promise<APIGatewayProxyResult> {
  const params: DynamoDB.DocumentClient.GetItemInput = {
    TableName: BingoAnswerTable,
    Key: { cardDate: date, username },
  };

  return await new Promise(
    (
      resolve: (x: APIGatewayProxyResult) => void,
      reject: (err: APIGatewayProxyResult) => void
    ): void => {
      dynamoDb.get(params, (error, data) => {
        if (error) {
          reject({
            statusCode: Number(error.code),
            body: error.message,
          });
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
