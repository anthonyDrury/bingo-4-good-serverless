import { MongoClient, MongoError, ObjectID } from "mongodb";
import { usersCollection } from "../types/mongo.type";
import { shortUser } from "../types/API.types";

let cachedClient: MongoClient;

async function clientConnection(): Promise<MongoClient> {
  if (!cachedClient) {
    const client = MongoClient;
    const uri = `mongodb+srv://${process.env.MONGO_USER}:${escape(
      process.env.MONGO_PASSWORD
    )}@${process.env.MONGO_ADDRESS}/test?retryWrites=true&w=majority`;
    await client.connect(uri).then(
      (clientDB) => {
        cachedClient = clientDB;
      },
      (err: MongoError): void => {
        if (err) {
          throw new Error(err.errmsg);
        }
      }
    );
  }
  return cachedClient;
}

export async function getUsers(userIDs: string[]): Promise<shortUser[]> {
  const client = await clientConnection();
  const results: shortUser[] = [];

  return new Promise(
    (resolve: () => void, reject: (err: string) => void): void => {
      const collection = client.db("Users").collection("User");
      const objIDArr = userIDs.map((x: string): ObjectID => new ObjectID(x));
      collection
        .find({ _id: { $in: objIDArr } })
        .forEach((item: usersCollection): void => {
          results.push({ _id: item._id, userName: item.userName });
        })
        .then(
          (): void => {
            resolve();
          },
          (reason: string): void => {
            console.log("ERROR: FIND FRIENDS - " + reason);
            reject(reason);
          }
        );
    }
  ).then(
    (): shortUser[] => {
      return results;
    },
    (err: string): never => {
      console.log("ERROR: SEARCH USER - " + err);
      throw new Error(err);
    }
  );
}

export async function findCurrentUser(
  userName: string
): Promise<usersCollection> {
  const client = await clientConnection();
  let result: usersCollection;
  return new Promise(
    (resolve: () => void, reject: (err: string) => void): void => {
      const collection = client.db("Users").collection("User");

      collection
        .findOne({ userName })
        .catch((findErr: MongoError): void => reject(findErr.errmsg))
        .then(
          (item: usersCollection): void => {
            result = item;
            console.table(`findONe: ${result}`);
            resolve();
          },
          (reason: string): void => {
            console.log("ERROR: FIND FRIENDS - " + reason);
            reject(reason);
          }
        );
    }
  ).then(
    (): usersCollection => {
      return result;
    },
    (err: string): never => {
      client.close();
      console.log("ERROR: GET CURRENT - " + err);
      throw new Error(err);
    }
  );
}
