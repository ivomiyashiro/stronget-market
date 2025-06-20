// Add Request type extension for authenticated requests
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: string;
    };
  }
}

export {};
