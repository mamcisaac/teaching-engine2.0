declare namespace Express {
  export interface Request {
    user?: {
      id: number;
      userId: string;
      email: string;
    };
  }
}
