import { Request } from "express";
import { reqObj } from "./types";

class setFileContentToReq {
    private obj: reqObj;
    private req: Request;
    constructor(req: Request, obj: reqObj) {
        this.req = req;
        this.obj = obj;
    }

    setFileNames(fileObj: any, type: string): void {
        if (type == "disk")
            fileObj["filepath"] = fileObj["filepath"];
        else
            fileObj["buffer"] = fileObj["buffer"];

        this.req["file"].push(fileObj);

    }
}

export default setFileContentToReq;