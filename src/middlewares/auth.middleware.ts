import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError("Authorization header missing or malformed", 404);
  }

  const token = authHeader.split(" ")[1];

  const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

  if (!decoded || !decoded.userId) {
    throw new ApiError("Invalid token provided", 404);
  }

  req.userId = decoded.userId;

  next();
};
