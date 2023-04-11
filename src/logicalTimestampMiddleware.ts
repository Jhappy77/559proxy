import { NextFunction, Request, Response } from 'express';

let myTimestamp = 0;

export const logicalTimestampMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const possibleReqTimestamp = req.header('lamportTimestamp');
    let incomingTimestamp = Number(possibleReqTimestamp);
    if(Number.isNaN(incomingTimestamp) || !incomingTimestamp) incomingTimestamp = 0;
    const maxTimestamp = Math.max(incomingTimestamp, myTimestamp);
    myTimestamp = maxTimestamp + 1;
    next();
}

export function getLamportTimestamp(): number {
    console.log("timestamp = " + myTimestamp);
    return myTimestamp;
}

export function incrementLamportTimestamp(): void {
    myTimestamp += 1;
}
