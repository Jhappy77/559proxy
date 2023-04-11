import { NextFunction, Request, Response } from 'express';

interface HttpException{
    status: number;
    message: string;
}

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Handling error in middleware!")
    const status: number = error.status || 570;
    const message: string = error.message || 'Something went wrong on proxy';

    // console.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
    res.status(status).json({ message });
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;