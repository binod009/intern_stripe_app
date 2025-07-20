import { Request, Response, NextFunction, response } from "express";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

export const authMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError("Authorization header missing or malformed", 404);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      stripeCustomerId: string;
    };

    if (!decoded || !decoded.userId) {
      throw new ApiError("Invalid token provided", 404);
    }

    req.user = decoded;

    next();
  }
);
