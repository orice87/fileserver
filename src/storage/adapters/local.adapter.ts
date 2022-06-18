import { IAdapter } from "./iadapter";
import { createWriteStream, createReadStream, existsSync, accessSync, constants} from 'fs';
import path from "path";
import { unlink } from "fs/promises";

export class LocalAdapter  implements IAdapter {

    private _storageDirectory! : string;

    constructor() {
        this._loadConfig();
        this._checkStorageDirectory();
    }

    public getReadFileStream(filename : string) : NodeJS.ReadableStream  {
        return createReadStream(path.join(this._storageDirectory, filename));
    }

    public getWriteFileStream(filename : string) : NodeJS.WritableStream {
        return createWriteStream(path.join(this._storageDirectory, filename));
    }

    public async removeFile(filename : string) : Promise<void> {
        await unlink(path.join(this._storageDirectory, filename));
    }

    private _checkStorageDirectory() {
        if(!existsSync(this._storageDirectory))
            throw new Error("Storage directory '" + this._storageDirectory + "' does not exits.");
        try {
            accessSync(this._storageDirectory, constants.W_OK);
        } catch(err) {
            throw new Error("Missing access rights to storage directory: '" + this._storageDirectory + "'");
        }
    }

    private _loadConfig() : void {
        if(!process.env.localStorageDirectory) 
            throw new Error("Missing 'localStorageDirectory' in configuration.");
        this._storageDirectory = process.env.localStorageDirectory;
    }    
}