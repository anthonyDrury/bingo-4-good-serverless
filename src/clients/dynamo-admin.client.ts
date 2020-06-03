import { DynamoDB, AWSError } from "aws-sdk";
import { APIGatewayProxyResult } from "aws-lambda";
import {
  bingoManage,
  bingoCardCollection,
  bingoItems,
} from "../types/dynamo.type";
import { shuffleArr, generateAccumulateArr } from "../common/support";
import * as moment from "moment";
import { BINGO_ITEM_VERSION_KEY } from "../constants/dynamo.const";

const dynamoDb = new DynamoDB.DocumentClient();
const describe = new DynamoDB();
const BingoCardTable = process.env.BINGO_CARDS_TABLE;
const BingoItemsTable = process.env.BINGO_ITEMS_TABLE;
const BingoManageTable = process.env.BINGO_MANAGE_TABLE;

function isProxyResult(res: APIGatewayProxyResult | any): boolean {
  if ((res as APIGatewayProxyResult).statusCode) {
    return true;
  }
  return false;
}

function addOneDay(date: number): number {
  return Number(moment(date.toString()).add(1, "day").format("YYYYMMDD"));
}

// Creates five more days of Bingo Cards
// Never called by user, does not need to be efficient
// Called by Rate event
export async function scheduledBingoCardCreation(): Promise<
  APIGatewayProxyResult
> {
  let result: APIGatewayProxyResult;
  // Get latest card date
  const params: DynamoDB.DocumentClient.GetItemInput = {
    TableName: BingoManageTable,
    Key: {
      _id: 0,
    },
  };
  const manageData: bingoManage | APIGatewayProxyResult = await new Promise(
    (
      resolve: (x: bingoManage) => void,
      reject: (err: APIGatewayProxyResult) => void
    ): void => {
      dynamoDb.get(params, (error, manageData) => {
        if (error) {
          reject({ statusCode: Number(error.code), body: error.message });
        }
        resolve(manageData.Item as bingoManage);
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
  // TO DO: TEST FOR FAILURE HERE AND RETURN/RETRY
  if (isProxyResult(manageData)) {
    return manageData as APIGatewayProxyResult;
  }

  // GET 16 random items from the bingoItems table
  // TODO: Do not get items that were used the day before

  // Get Description of Bingo_Item Table
  // We can then use this to know N size of table
  // Which will allow use to get a random 16 out of the table

  // TODO: call asynchronously with manageTable, as they do not rely on each other
  const itemTableDescription = await new Promise(
    (
      resolve: (x: DynamoDB.TableDescription) => void,
      reject: (err: APIGatewayProxyResult) => void
    ): void => {
      describe.describeTable(
        {
          TableName: BingoItemsTable,
        },
        (err: AWSError, data: DynamoDB.DescribeTableOutput) => {
          if (err) {
            reject({ statusCode: Number(err.code), body: err.message });
          }
          resolve(data.Table);
        }
      );
    }
  ).then(
    (result) => {
      return result;
    },
    (err) => {
      return err;
    }
  );

  if (isProxyResult(itemTableDescription)) {
    return itemTableDescription as APIGatewayProxyResult;
  }

  let bingoCardBatch: DynamoDB.DocumentClient.BatchWriteItemInput = {
    RequestItems: {
      [BingoCardTable]: [],
    },
  };

  let newDate = (manageData as bingoManage).latestCardDate;
  for (let i = 0; i < 5; i++) {
    newDate = addOneDay(newDate);

    // LOOP 5 TIMES

    // TO DO: Get Array of last used index of bingoCard
    // Then use this to filter those index's out of the new card

    // TO DO, change to 16 (when enough item are present)
    const newCardIndexArr: number[] = shuffleArr(
      generateAccumulateArr(
        (itemTableDescription as DynamoDB.TableDescription).ItemCount - 2
      )
    );
    const bingoItems = await new Promise(
      (
        resolve: (x: DynamoDB.TableDescription) => void,
        reject: (err: APIGatewayProxyResult) => void
      ): void => {
        const batchParam: DynamoDB.DocumentClient.BatchGetItemInput = {
          RequestItems: {
            [BingoItemsTable]: {
              Keys: newCardIndexArr.map((num: number) => {
                return {
                  _id: BINGO_ITEM_VERSION_KEY,
                  index: num,
                };
              }),
            },
          },
        };

        dynamoDb.batchGet(
          batchParam,
          (err: AWSError, data: DynamoDB.DocumentClient.BatchGetItemOutput) => {
            if (err) {
              reject({ statusCode: Number(err.code), body: err.message });
            }
            resolve((data?.Responses as any)["Bingo_Items"]);
          }
        );
      }
    ).then(
      (result) => {
        return result;
      },
      (err) => {
        return err;
      }
    );

    if (isProxyResult(bingoItems)) {
      return bingoItems;
    }

    const bingoCard: bingoCardCollection = {
      dateUsed: newDate,
      items: (bingoItems as bingoItems[]).map((item, index) => {
        return {
          _id: item._id,
          statement: item.statement,
          position: index,
        };
      }),
    };

    bingoCardBatch.RequestItems[BingoCardTable].push({
      PutRequest: {
        Item: bingoCard,
      },
    });
  }

  result = await new Promise(
    (
      resolve: (x: APIGatewayProxyResult) => void,
      reject: (err: APIGatewayProxyResult) => void
    ): void => {
      dynamoDb.batchWrite(
        bingoCardBatch,
        (err: AWSError, data: DynamoDB.DocumentClient.BatchWriteItemOutput) => {
          if (err) {
            reject({ statusCode: Number(err.code), body: err.message });
          }
          resolve({ statusCode: 200, body: JSON.stringify(data) });
        }
      );
    }
  ).then(
    (result) => {
      return result;
    },
    (err) => {
      return err;
    }
  );

  if (result.statusCode !== 200) {
    return result;
  }

  const updateManageParams: DynamoDB.DocumentClient.UpdateItemInput = {
    TableName: BingoManageTable,
    Key: {
      _id: 0,
    },
    UpdateExpression: "set latestCardDate = :newDate",
    ExpressionAttributeValues: {
      ":newDate": newDate,
    },
  };
  result = await new Promise(
    (
      resolve: (x: APIGatewayProxyResult) => void,
      reject: (err: APIGatewayProxyResult) => void
    ): void => {
      dynamoDb.update(updateManageParams, (error, data) => {
        if (error) {
          reject({ statusCode: Number(error.code), body: error.message });
        }
        resolve({ statusCode: 200, body: "success" });
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

  return result;
}
