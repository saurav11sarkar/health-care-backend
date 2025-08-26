import { NextFunction, Request, Response } from "express";
import { jwtHelpers } from "../../helper/jwtHelpers";
import config from "../../config";
import { JwtPayload, Secret } from "jsonwebtoken";
import AppError from "../error/appError";
import http from "http-status-codes";

declare global {
  namespace Express {
    interface Request {
      user?: any | JwtPayload;
    }
  }
}

const auth = (...role: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) throw new AppError(http.UNAUTHORIZED, "Your are not authorized");

      const varifiedToken = jwtHelpers.verifyToken(
        token,
        config.jwt.jwt_secret as Secret
      ) as JwtPayload;
      if (role.length && !role.includes(varifiedToken.role)) {
        throw new AppError(http.UNAUTHORIZED, "Your are not authorized");
      }
      req.user = varifiedToken;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
