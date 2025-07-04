declare module Express {
  export interface Request {
    user?: {
      id: number;
      email: string;
      role: string;
      organizationId?: number;
      permissions?: string[];
    };
  }
}
