import { Request } from "express";

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
    "filesize": Array<number>
}
export interface file {
    mimetype: string,
    originalname: string,
    filesize: number
}

export interface options {
    attachFileToReqBody?: boolean,
    filesCount?: number,
    fileSize?:number,
    filename: (
        req: Request,
        file: file,
        cb: (error: Error | null, filename: string) => void
    ) => void,
    destination:  (
        req: Request,
        file: file,
        cb: (error: Error | null, filepath: string) => void
    ) => void,
    fileFilter?:(
        req: Request,
        file: file,
        cb: (error: Error | null, bool: boolean) => void
    )=>void

}