import { NextFunction, Request, Response } from "express";

export function contentTypeRequired(req : Request, res : Response, next : NextFunction) : Response | void {
    if(!req.headers['content-type']) return res.status(400).send("Missing content-type header.");
    next();
}