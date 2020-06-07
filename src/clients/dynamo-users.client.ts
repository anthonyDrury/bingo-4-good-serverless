import { DynamoDB } from "aws-sdk";
import { generateUser } from "../common/support";
import { APIGatewayProxyResult } from "aws-lambda";
import { usersCollection } from "../types/dynamo.type";

const dynamoDb = new DynamoDB.DocumentClient();

export async function addNewUser(
  username: string,
  email: string
): Promise<void | APIGatewayProxyResult> {
  const params = {
    TableName: process.env.USERS_TABLE,
    Item: {
      ...generateUser({ username, email }),
    } as usersCollection,
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

export async function findUsers(
  searchTerm: string
): Promise<APIGatewayProxyResult> {
  const params: DynamoDB.DocumentClient.ScanInput = {
    TableName: process.env.USERS_TABLE,
    FilterExpression: "begins_with (userName, :val)",
    ExpressionAttributeValues: { ":val": searchTerm },
  };

  return await new Promise(
    (
      resolve: (x: APIGatewayProxyResult) => void,
      reject: (err: APIGatewayProxyResult) => void
    ): void => {
      dynamoDb.scan(params, function (error, data) {
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

export async function getUser(userName: string) {
  const params: DynamoDB.DocumentClient.GetItemInput = {
    TableName: process.env.USERS_TABLE,
    Key: {
      userName,
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

export async function getUsers(
  usernames: string[]
): Promise<APIGatewayProxyResult> {
  const params: DynamoDB.DocumentClient.BatchGetItemInput = {
    RequestItems: {
      [process.env.USERS_TABLE]: {
        Keys: usernames.map((username) => {
          return {
            username,
          };
        }),
      },
    },
  };

  return await new Promise(
    (
      resolve: (x: APIGatewayProxyResult) => void,
      reject: (err: APIGatewayProxyResult) => void
    ): void => {
      dynamoDb.batchGet(params, function (error, data) {
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

export async function addFriendIDToUser(
  currentUsername: string,
  username: string
): Promise<APIGatewayProxyResult> {
  // Add friendID to currentUsers friends[],
  // IF friendID is not already present
  const params: DynamoDB.DocumentClient.UpdateItemInput = {
    TableName: process.env.USERS_TABLE,
    Key: {
      username: currentUsername,
    },
    ExpressionAttributeValues: { ":friendId": [username] },
    UpdateExpression: "set friends = list_append (friends, :friendId)",
    ConditionExpression: "not contains (friends, :friendId)",
  };

  return await new Promise(
    (
      resolve: (x: APIGatewayProxyResult) => void,
      reject: (err: APIGatewayProxyResult) => void
    ): void => {
      dynamoDb.update(params, function (error, data) {
        if (error) {
          reject({ statusCode: Number(error.code), body: error.message });
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
