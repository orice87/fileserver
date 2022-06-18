import { ObjectId } from "mongodb";

export interface Metadata{
    _id? : ObjectId
    filename : string,
    size : number,
    contentType : string,
    uploadedAt : Date
}