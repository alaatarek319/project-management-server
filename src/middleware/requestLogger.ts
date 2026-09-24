import type { Request, Response, NextFunction } from "express";


const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    console.log(`\n🔵 [${req.method}] ${req.url}`);
    
    console.log("Headers 'Content-Type':", req.headers['content-type']);
    
    console.log("Body:", req.body);

    next();
};

export default requestLogger;