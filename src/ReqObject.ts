
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