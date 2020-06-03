// Users Table types

// _id - primary key
export type usersCollection = {
  _id?: string;
  userName: string;
  email: string;
  status: "free" | "paid" | "admin";
  answers: userAnswer[];
  friends: friends[];
  properties: {
    points: number;
    streak: number;
    highestPoints: number;
    highestStreak: number;
  };
};

export type friends = {
  _id: string;
  userName: string;
};

export type userAnswer = {
  itemID: string;
  answer: string;
  dateAnswered: Date;
};

// Bingo_Card Table types

// _id - primary key
// date - sort key
export type bingoCardCollection = {
  dateUsed: number;
  items: bingoItemShort[];
};

export type bingoItemShort = {
  _id: string;
  statement: string;
  position: number;
};

// Bingo_Items Table types

// _id - primary key
export type bingoItems = {
  _id: string;
  statement: string;
  prevUsed: number[];
  lastUsedDate?: number;
  disabled: boolean;
};

// Bingo Manage Table types
export type bingoManage = {
  _id: 0;
  latestCardDate: number; // YYYYMMDD
};
