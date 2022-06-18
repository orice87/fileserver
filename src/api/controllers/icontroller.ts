import { Router } from "express";

export interface IController {
    init() : Promise<Router>;
}