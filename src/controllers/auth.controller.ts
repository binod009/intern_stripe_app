import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler";

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret";

const validRefreshTokens = new Set<string>();

export const refreshTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body as { refreshToken?: string };

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    try {
      const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
        userId: string;
        email?: string;
      };

      const accessToken = jwt.sign(
        { userId: payload.userId, email: payload.email },
        ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken });
    } catch (err) {
      res.status(403).json({ message: "Invalid or expired refresh token" });
    }
  }
);

export default refreshTokenController;
