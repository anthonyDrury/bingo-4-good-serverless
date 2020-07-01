// Users Table types

// username - primary key
export type usersCollection = {
  username: string;
  email: string;
  status: "free" | "paid" | "admin";
  friends: friends[];
  points: number;
  streak: number;
  highestPoints: number;
  highestStreak: number;
  basePoints: usersLastActiveDay;
};

export type usersLastActiveDay = {
  points: number;
  streak: number;
  cardDate: number;
};

export type friends = {
  userName: string;
};

export type userAnswer = {
  itemID: string;
  answer: string;
  dateAnswered: Date;
};

// Bingo_Card Table types

// date - primary key
export type bingoCardCollection = {
  dateUsed: number;
  items: bingoItemShort[];
};

export type bingoItemShort = {
  itemIndex: number;
  statement: string;
  label?: string;
  position: number;
};

// Bingo_Items Table types

// _id - primary key
// index - sort key
export type bingoItems = {
  _id: string;
  index: number;
  statement: string;
  label?: string;
};

// Bingo Manage Table types
export type bingoManage = {
  _id: 0;
  latestCardDate: number; // YYYYMMDD
};

// Bingo Answers Table types
export type bingoAnswers = {
  cardDate: number;
  username: string;
  answers: bingoAnswersMap[];
};

export type bingoAnswersMap = bingoItemShort & {
  answer: string;
  private: boolean;
};
