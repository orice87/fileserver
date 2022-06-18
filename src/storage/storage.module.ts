import { IAdapter} from './adapters/iadapter';
import { LocalAdapter } from './adapters/local.adapter';

export enum SupportedAdapters {
    local = "local"
}

export class StorageModule {

    private _adapter : IAdapter;

    constructor(adapterName : SupportedAdapters) {
        switch(adapterName) {
            case(SupportedAdapters.local): this._adapter = new LocalAdapter(); break;
        }
    }

    public getWriteFileStream(filename : string) : NodeJS.WritableStream {
        return this._adapter.getWriteFileStream(filename);
    }

    public getReadFileStream(filename : string) : NodeJS.ReadableStream  {
        return this._adapter.getReadFileStream(filename);
    }

    public async removeFile(filename : string) : Promise<void> {
        return this._adapter.removeFile(filename);
    }
}