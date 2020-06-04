import { baseUser } from "../types/API.types";
import { usersCollection } from "../types/dynamo.type";

export function isDefined(x: any | undefined | null): boolean {
  return x !== undefined && x !== null;
}

export function generateUser(base: baseUser): usersCollection {
  return {
    ...base,
    status: "free",
    friends: [],
    points: 0,
    streak: 0,
    highestPoints: 0,
    highestStreak: 0,
  };
}

export function shuffleArr(array: number[]) {
  let i = array.length;
  let j = 0;
  let temp;

  while (i--) {
    j = Math.floor(Math.random() * (i + 1));

    // swap randomly chosen element with current element
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
}

export function generateAccumulateArr(num: number): number[] {
  const newArr: number[] = [];

  for (let i = 0; i < num; i++) {
    newArr.push(i);
  }

  return newArr;
}
