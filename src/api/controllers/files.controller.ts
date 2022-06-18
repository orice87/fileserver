import  express, {Request, Response, Router} from 'express';
import { StorageModule, SupportedAdapters } from '../../storage/storage.module';
import { MetadataModule } from '../../metadata/metadata.module';
import { MonitoringModule } from '../../monitoring/monitoring.module';
import { IController } from './icontroller';
import { contentLengthRequired } from '../middlewares/content-length-required';
import { contentTypeRequired } from '../middlewares/content-type-required';
import { Metadata } from '../../metadata/models/metadata';

export class FilesController implements IController{
    
    private readonly _storageModule : StorageModule;
    private readonly _metadataModule : MetadataModule;
    private readonly _monitoringModule : MonitoringModule;

    constructor() {
        this._storageModule = new StorageModule(SupportedAdapters.local);
        this._metadataModule = new MetadataModule();
        this._monitoringModule = new MonitoringModule();
    }

    public async init() : Promise<Router> {
        await this._metadataModule._init();
        const router = express.Router();

        router.get(
            "/space",
             this._getTotalSpaceUsed.bind(this)
        );
        router.get(
            "/:filename",
             this._downloadFileStream.bind(this)
        );
        router.put(
            "/:filename", 
            contentLengthRequired, 
            contentTypeRequired, 
            this._uploadFileStream.bind(this)
        );

        return router;
    }

    private _getTotalSpaceUsed(req : Request, res : Response) : Response {
        return res.send({
            bytes : this._metadataModule.getTotalSpaceUsed()
        });
    }

    private async _downloadFileStream(req : Request, res : Response) : Promise<Response> {
        const filename = req.params.filename;
        const metadata = await this._metadataModule.findMetadataByFileName(filename);
        if(!metadata) return res.sendStatus(404);
        const downloadPromise = this._prepareStreamDownloadPromise(res, metadata);
        try {
            await downloadPromise;
            return res;
        } catch(err) {
            return res.status(500).send(err);
        }
    }

    private async _uploadFileStream(req : Request, res : Response) : Promise<Response> {
        const filename = req.params.filename;
        const size = parseInt(req.headers["content-length"] as string); //we made sure that content-length is filled via a middleware
        const contentType = req.headers["content-type"] as string; //we made sure that content-length is filled via a middleware

        const metadata : Metadata = {
            filename,
            size,
            contentType,
            uploadedAt : new Date()
        };

        const uploadPromise = this._prepareStreamUploadPromise(req, metadata);

        try {
            await uploadPromise;
        } catch(err) {
            return res.status(500).send(err);
        }

        try {
            await this._metadataModule.upsertMetadata(metadata);
            return res.send(metadata);
        } catch(err) {
            //Cleaning the mess if database fails
            await this._storageModule.removeFile(filename);
            return res.status(500).send(err);
        }
        
    }

    private _prepareStreamUploadPromise(req : Request, metadata : Metadata) : Promise<void> {
        const filename = metadata.filename;
        return new Promise<void>((resolve, reject) => {
            const writableStream = this._storageModule.getWriteFileStream(filename);
            writableStream.on("error", err => {
                this._monitoringModule.fileUploadError(filename, err);
                reject(err);
            });
            writableStream.on("close", () => {
                this._monitoringModule.fileUploadFinished(filename, metadata.size);
                resolve();
            });
            writableStream.on("open", () => {
                this._monitoringModule.fileUploadStarted(filename, metadata.size);
                req.pipe(writableStream);
            });
        });
    }

    private _prepareStreamDownloadPromise(res : Response, metadata : Metadata) : Promise<void> {
        const filename = metadata.filename;
        const readableStream = this._storageModule.getReadFileStream(filename);
        return new Promise<void>((resolve, reject) => {
            readableStream.on("error", err => {
                reject(err);
            });
            readableStream.on("open", () => {
                res.setHeader("Content-Length",metadata.size);
                res.setHeader("Content-Type",metadata.contentType);
                res.setHeader("Content-Disposition", "attachment; filename='" + filename + "'");
                readableStream.pipe(res);
            });
            readableStream.on("close", () => {
                resolve();
            });
              
        })
    }
}