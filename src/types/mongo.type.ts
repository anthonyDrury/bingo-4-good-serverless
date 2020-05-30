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
