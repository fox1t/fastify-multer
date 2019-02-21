import express from 'express';
import { Setup } from '../interfaces';
declare function makeMiddleware(setup: Setup): (req: express.Request, res: express.Response, next: express.NextFunction) => void;
export default makeMiddleware;
