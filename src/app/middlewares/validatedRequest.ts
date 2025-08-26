import { NextFunction, Request, Response } from "express";
import { ZodAny } from "zod";

const validatedRequest = (shema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await shema.parseAsync({
        body: req.body,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validatedRequest;
