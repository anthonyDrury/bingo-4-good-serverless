// Users Table types

// _id - primary key
export type usersCollection = {
  _id?: string;
  userName: string;
  email: string;
  status: "free" | "paid" | "admin";
  friends: friends[];
  points: number;
  streak: number;
  highestPoints: number;
  highestStreak: number;
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
  itemIndex: number;
  statement: string;
  position: number;
};

// Bingo_Items Table types

// _id - primary key
// index - sort key
export type bingoItems = {
  _id: string;
  index: number;
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

// Bingo Answers Table types
export type bingoAnswers = {
  cardDate: number;
  userID: string;
  answers: bingAnswersMap[];
};

export type bingAnswersMap = bingoItemShort & {
  answer: string;
  private: boolean;
};
