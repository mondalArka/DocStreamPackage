import { Request } from "express";
import FormfluxError from "./FormFluxError";

export interface reqObj {
    "originalReq": string;
    "modifiedReq": Buffer;
    "data": Array<string>;
    "content": Array<Buffer>,
    "contentBody": Array<string>,
    "metaData": Array<string>,
    "mimeType": Array<string>,
    "fieldNameBody": Array<string>,
    "fileName": Array<string>,
    "modifiedFileName": Array<string>,
    "fieldNameFile": Array<string>,
    "filePath": Array<string>,
    "filesize": Array<number>,
    "streams":Array<any>
}
export interface File {
    mimetype: string,
    originalname: string,
    filesize: number
}

export interface options {
    attachFileToReqBody?: boolean,
    filesCount?: number,
    fileSize?:number,
    maxFields?:number,
    filename: (
        req: Request,
        file: File,
        cb: (error: FormfluxError | null, filename: string) => void
    ) => void,
    destination:  (
        req: Request,
        file: File,
        cb: (error: FormfluxError | null, filepath: string) => void
    ) => void,
    fileFilter?:(
        req: Request,
        file: File,
        cb: (error: Error | null, bool: boolean) => void
    )=>void

}

export interface optionSingle {
    attachFileToReqBody?: boolean,
    filesCount?: number,
    fileSize?:number,
    maxFields?:number,
    filename: (
        req: Request,
        file: File,
        cb: (error: FormfluxError | null, filename: string) => void
    ) => void,
    fileFilter?:(
        req: Request,
        file: File,
        cb: (error: Error | null, bool: boolean) => void
    )=>void

}

interface fieldObject{
    name:string,
    maxCount?:number,
    filesize?:number
}

export type optionFields = [fieldObject,...fieldObject[]];