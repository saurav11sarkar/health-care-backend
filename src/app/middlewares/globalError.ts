import { NextFunction, Request, Response } from "express";

const globalError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || err.name || "Internal server error",
    error: err,
    stack: err.stack,
  });
};

export default globalError;
