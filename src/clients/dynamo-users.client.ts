import { DynamoDB } from "aws-sdk";
import { generateUser } from "../common/support";
import { APIGatewayProxyResult } from "aws-lambda";
import { usersCollection } from "../types/dynamo.type";

const dynamoDb = new DynamoDB.DocumentClient();

export async function addNewUser(
  _id: string,
  userName: string,
  email: string
): Promise<void | APIGatewayProxyResult> {
  const params = {
    TableName: process.env.USERS_TABLE,
    Item: {
      _id,
      ...generateUser({ userName, email }),
    } as usersCollection,
  };

  return await new Promise(
    (
      resolve: (x: APIGatewayProxyResult) => void,
      reject: (err: APIGatewayProxyResult) => void
    ): void => {
      dynamoDb.put(params, (error, data) => {
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

export async function getUser(_id: string) {
  const params: DynamoDB.DocumentClient.GetItemInput = {
    TableName: process.env.USERS_TABLE,
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

export async function getUsers(ids: string[]): Promise<APIGatewayProxyResult> {
  const params: DynamoDB.DocumentClient.BatchGetItemInput = {
    RequestItems: {
      [process.env.USERS_TABLE]: {
        Keys: ids.map((_id) => {
          return {
            _id,
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
  currentID: string,
  _id: string
): Promise<APIGatewayProxyResult> {
  // Add friendID to currentUsers friends[],
  // IF friendID is not already present
  const params: DynamoDB.DocumentClient.UpdateItemInput = {
    TableName: process.env.USERS_TABLE,
    Key: {
      _id: currentID,
    },
    ExpressionAttributeValues: { ":friendId": [_id] },
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
