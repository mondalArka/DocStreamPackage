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
    "fileName": Array<string>
    "fieldNameFile": Array<string>,
    "filePath": Array<string>,
    "filesize": Array<number>
}

interface filenameObj {
    mimetype?: string | null,
    name: string
}

interface destinationObj {
    mimetype?: string | null,
    path: string
}
type NonEmptyArray<T> = [T, ...T[]];
export interface file {
    mimetype: string,
    originalname: string,
}

export interface options {
    case: "stream" | "bulk",
    attachFileToReq?: boolean,
    attachFileToReqBody?: boolean,
    filesCount?: number,
    filename: (
        req: Request,
        file: file,
        cb: (error: Error | null, filename: string) => void
    ) => void,
    destination: NonEmptyArray<destinationObj>

}