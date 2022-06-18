import express, { Application } from "express";
import { FilesController } from './controllers/files.controller';

export class ApiModule {

    private _port! : number;
    
    constructor(
        private readonly _filesController : FilesController = new FilesController()
    ) {
        this._loadConfig();
    }

    public async init() : Promise<Application> {
        const server = express();
        server.use("/test", (req,res) => res.send(req.body));
        server.use("/files", await this._filesController.init())

        const startPromise = new Promise<void>((resolve, reject) => {
            server.once("error", err => {
                reject(err);
            })
            server.listen(this._port, () => {
                console.log("API Service has started on :" + this._port);
                resolve();
            });
        });
        
        await startPromise;
        return server;
    }

    private _loadConfig() : void {
        if(!process.env.port) throw new Error("Missing 'port' in configuration.");
        this._port = parseInt(process.env.port);
    }

}