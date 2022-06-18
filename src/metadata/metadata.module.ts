import { Collection, MongoClient } from "mongodb";
import { Metadata } from './models/metadata';
import { MonitoringModule } from '../monitoring/monitoring.module';

export class MetadataModule {
    
    private readonly _monitoringModule : MonitoringModule;

    private _connectionString! : string;
    private _databaseName! : string;
    private _metadataCollection! : Collection;
    private _totalSpaceUsed! : number;
    private _spaceUsedTreshold! : number;

    constructor() {
        this._monitoringModule = new MonitoringModule();
        this._loadConfig();
    }
    
    public async upsertMetadata(metadata : Metadata) : Promise<void>  {
        this._checkInit();
        const result = await this._metadataCollection.updateOne(
            {filename : metadata.filename}, 
            {$set : metadata}, 
            {upsert : true});
        if(result.upsertedId) this._totalSpaceUsed += metadata.size;
        else this._totalSpaceUsed = await this._countTotalSpaceUsed();

        if(this._totalSpaceUsed > this._spaceUsedTreshold)
            this._monitoringModule.sizeTresholdExceeded(this._totalSpaceUsed, this._spaceUsedTreshold);
    }

    public getTotalSpaceUsed() : number {
        this._checkInit();
        return this._totalSpaceUsed;
    }

    public async findMetadataByFileName(filename : string) : Promise<Metadata|null>  {
        this._checkInit();
        const result = await this._metadataCollection.findOne({filename});
        if(!result) return null;
        return {
            _id : result._id,
            filename : result.filename,
            size : result.size,
            contentType : result.contentType,
            uploadedAt : result.uploadedAt,
        }
    }

    public async _init() : Promise<void> {
        try {
            const client = await MongoClient.connect(this._connectionString);
            const db = client.db(this._databaseName);
            this._metadataCollection = db.collection("metadata");
            this._metadataCollection.createIndex({filename : 1});
            this._totalSpaceUsed = await this._countTotalSpaceUsed();
            console.log("Database connection established successfully.");

        } catch(error) {
            console.log(error);
            throw new Error("Database connection failed!");
        }
        
    }

    private async _countTotalSpaceUsed() : Promise<number> {
        if(!this._metadataCollection) throw new Error("Missing db connection. Metadata module was not initialized properly.");
        const result = await this._metadataCollection.aggregate([{
            $group : {
                _id : null,
                "totalSize" : {
                    $sum : "$size"
                }
            }
        }]).next();
        return result ? result.totalSize : 0;       
    }

    private _checkInit() : void {
        if(!this._metadataCollection) 
            throw new Error("Missing db connection. Metadata module was not initialized properly.");
        if(!this._totalSpaceUsed && this._totalSpaceUsed !== 0) 
            throw new Error("Sum of total space used was not calculated yet. Metadata module was not initialized properly.");

    }

    private _loadConfig() : void {
        if(!process.env.mongoConnectionString) 
            throw new Error("Missing 'mongoConnectionString' in configuration.");
        this._connectionString = process.env.mongoConnectionString;
        if(!process.env.mongoDatabaseName) 
            throw new Error("Missing 'mongoDatabaseName' in configuration");
        this._databaseName = process.env.mongoDatabaseName;
        if(!process.env.spaceUsedTreshold) 
            throw new Error("Missing 'spaceUsedTreshold' in configuration");
        this._spaceUsedTreshold = parseInt(process.env.spaceUsedTreshold);
    }

}