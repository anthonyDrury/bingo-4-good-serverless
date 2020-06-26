import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyResult } from "aws-lambda";
import { bingoAnswers, usersCollection } from "../types/dynamo.type";
import {
  removePrivateAnswers,
  isDefined,
  hasStreak,
  isProxyResult,
  calculateNewUser,
} from "../common/support";

const dynamoDb = new DynamoDB.DocumentClient();
const BingoAnswerTable = process.env.BINGO_ANSWERS_TABLE;
const UsersTable = process.env.USERS_TABLE;

export async function updateAnswer(
  newAnswer: bingoAnswers
): Promise<APIGatewayProxyResult> {
  const params: DynamoDB.DocumentClient.PutItemInput = {
    TableName: BingoAnswerTable,
    Item: newAnswer,
  };
  const includesStreak = hasStreak(newAnswer.answers);

  // These can be run simultaneously
  return await Promise.all([
    updatePointsAndStreak({
      username: newAnswer.username,
      hasStreak: includesStreak,
      cardDate: newAnswer.cardDate,
      newPoints: newAnswer.answers.length,
    }),
    new Promise(
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
    ),
  ]).then((value: any[]) => value[0]);
}

async function updatePointsAndStreak({
  username,
  hasStreak,
  newPoints,
  cardDate,
}) {
  const params: DynamoDB.DocumentClient.GetItemInput = {
    TableName: UsersTable,
    Key: {
      username,
    },
  };
  const user = await new Promise(
    (
      resolve: (x: usersCollection) => void,
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
        resolve(data.Item as usersCollection);
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
  if (isProxyResult(user)) {
    return user;
  }

  const newUser = calculateNewUser(user, hasStreak, newPoints, cardDate);
  const putParams: DynamoDB.DocumentClient.PutItemInput = {
    TableName: UsersTable,
    Item: newUser,
  };
  return await new Promise(
    (
      resolve: (x: {}) => void,
      reject: (err: APIGatewayProxyResult) => void
    ): void => {
      dynamoDb.put(putParams, (error) => {
        if (error) {
          reject({
            statusCode: Number(error.code),
            body: error.message,
          });
          return;
        }
        resolve({
          statusCode: 200,
          body: JSON.stringify({
            points: newUser.points,
            streak: newUser.streak,
          }),
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
          console.log(error);
          reject({
            statusCode: 500,
            body: error.message,
          });
          return;
        }
        const response =
          isDefined(data.Item) && username !== undefined
            ? {
                ...data.Item,
                answers: removePrivateAnswers(data.Item.answers),
              }
            : data.Item;
        resolve({
          statusCode: 200,
          body: JSON.stringify(response),
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
