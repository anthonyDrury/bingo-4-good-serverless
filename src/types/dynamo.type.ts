// Users Table types
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
  statementID: string;
  answer: string;
  dateAnswered: Date;
};

// Bingo_Card Table types

export type bingoCardCollection = {
  _id: string;
  items: bingoItemShort[];
  date: Date;
  disabled?: boolean;
};

export type bingoItemShort = {
  itemID: string;
  statement: string;
  position: number;
};

// Bingo_Items Table types

export type bingoItems = {
  _id: string;
  statement: string;
  lastUsedDate: Date;
};
