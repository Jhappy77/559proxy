import { NextFunction, Request, Response } from 'express';

let myTimestamp = 0;

export const logicalTimestampMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const possibleReqTimestamp = req.header('lamportTimestamp');
    let incomingTimestamp = Number(possibleReqTimestamp);
    onRecieveTimestamp(incomingTimestamp);
    next();
}

export function onRecieveTimestamp(incoming: any){
    let i = incoming;
    if(Number.isNaN(i) || !i || typeof(i) !== `number`){
        i = 0;
    } 
    const maxTimestamp = Math.max(i, myTimestamp);
    myTimestamp = maxTimestamp + 1;
}

export function getLamportTimestamp(): number {
    console.log("timestamp = " + myTimestamp);
    return myTimestamp;
}

export function incrementLamportTimestamp(): void {
    myTimestamp += 1;
}
