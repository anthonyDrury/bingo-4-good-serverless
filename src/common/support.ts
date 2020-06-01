import { baseUser } from "../types/API.types";
import { usersCollection } from "../types/dynamo.type";

export function isDefined(x: any | undefined | null): boolean {
  return x !== undefined && x !== null;
}

export function generateUser(base: baseUser): usersCollection {
  return {
    ...base,
    status: "free",
    answers: [],
    friends: [],
    properties: {
      points: 0,
      streak: 0,
      highestPoints: 0,
      highestStreak: 0,
    },
  };
}
