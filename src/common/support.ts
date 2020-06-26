import { baseUser } from "../types/API.types";
import { usersCollection, bingoAnswersMap } from "../types/dynamo.type";
import { STREAK_MAP } from "../constants/bingo.const";
import { APIGatewayProxyResult } from "aws-lambda";
import { findUsers } from "../clients/dynamo-users.client";

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
    basePoints: {
      points: 0,
      streak: 0,
      cardDate: 0,
    },
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

// If answer is private, do not return it
export function removePrivateAnswers(
  answers: bingoAnswersMap[]
): bingoAnswersMap[] {
  return answers.map(
    (answer): bingoAnswersMap => {
      if (answer.private) {
        return {
          ...answer,
          answer: "",
        };
      }
      return answer;
    }
  );
}

export function hasStreak(answers: bingoAnswersMap[]) {
  const answerIndexArr = answers.map((answers) => answers.position);

  // If the answers array has any of the streak combinations
  const includesStreak = STREAK_MAP.some((streakArr: number[]) =>
    streakArr.every((num) => answerIndexArr.includes(num))
  );
  return includesStreak;
}

export function isProxyResult(res: APIGatewayProxyResult | any): boolean {
  if ((res as APIGatewayProxyResult).statusCode) {
    return true;
  }
  return false;
}

// Calculates the new user when supplied new points and streaks
export function calculateNewUser(
  user: usersCollection,
  hasStreak: boolean,
  newPoints: number,
  cardDate: number
): usersCollection {
  const isNewDate = user.basePoints.cardDate !== cardDate;
  const basePoints = isNewDate
    ? {
        cardDate,
        points: user.points,
        streak: user.streak,
      }
    : user.basePoints;
  const userPoints = basePoints.points + newPoints;
  const userStreak = basePoints.streak + (hasStreak ? 1 : 0);
  return {
    ...user,
    points: userPoints,
    streak: userStreak,
    highestPoints:
      user.highestPoints > userPoints ? user.highestPoints : userPoints,
    highestStreak:
      user.highestStreak > userStreak ? user.highestStreak : userStreak,
    basePoints,
  };
}
