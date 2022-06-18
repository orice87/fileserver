import { NextFunction, Request, Response } from "express";

export function contentLengthRequired(req : Request, res : Response, next : NextFunction) : Response | void {
    if(!req.headers['content-length']) return res.status(400).send("Missing content-length header.");
    next();
}