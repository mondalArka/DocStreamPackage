import { Request } from "express";
import { reqObj } from "./types";

class setFileContentToReq {
    private obj: reqObj;
    constructor(obj: reqObj) {
        this.obj = obj;
    }

     setFileNames(req: Request): void {
        if (this.obj.metaData.length > 0) {
            for (let i = 0; i < this.obj.metaData.length; i++) {
                req["file"] = req["file"] ? [...req["file"]] : [];
                req["file"].push({
                    originalname: this.obj.fileName[i],
                    mimetype: this.obj.mimeType[i],
                    filepath: this.obj.filePath[i],
                    filesize: this.obj.filesize[i]
                });
            }
        }
    }
}

export default setFileContentToReq;