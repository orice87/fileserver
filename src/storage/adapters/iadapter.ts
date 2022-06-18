
export interface IAdapter {

    getReadFileStream(filename : string) : NodeJS.ReadableStream;
    getWriteFileStream(filename : string) : NodeJS.WritableStream;
    removeFile(filename : string) : Promise<void>;

}