import { Request } from "express";
import { reqObj } from "./FormFlux.Types";
import FormfluxError from "./FormFluxError";

class setFileContentToReq {
    private obj: reqObj;
    private req: Request;
    private for: "any" | "fields" | "single";
    private storage: "memory" | "disk";
    constructor(req: Request, obj: reqObj, forReason: "any" | "fields" | "single", storage: "memory" | "disk") {
        this.req = req;
        this.obj = obj;
        this.for = forReason;
        this.storage = storage;
    }

    setFileNames(fileObj: any, field: string | null): void {
        switch (this.storage) {
            case "disk": {
                if (this.for == "any") {
                    delete fileObj["buffer"];
                    if (!Array.isArray(this.req["files"])) this.req["files"] = [];
                    fileObj["filepath"] = fileObj["filepath"];
                    this.req["files"].push(fileObj);
                }
                else if (this.for == "fields") {
                    delete fileObj["buffer"];
                    if (!this.req["files"]) this.req["files"] = {};
                    if (this.req["files"][`${field}`])
                        this.req["files"][`${field}`].push(fileObj);
                    else {
                        this.req["files"][`${field}`] = [];
                        this.req["files"][`${field}`].push(fileObj);
                    }
                }
                else if (this.for == "single") {
                    delete fileObj["buffer"];
                    this.req["file"] = fileObj;
                }
                break;
            }

            case "memory": {
                delete fileObj["filepath"];
                if (this.for == "any") {
                    if (!Array.isArray(this.req["files"])) this.req["files"] = [];
                    fileObj["buffer"] = fileObj["buffer"];
                    this.req["files"].push(fileObj);
                }
                else if (this.for == "fields") {
                    if (!this.req["files"]) this.req["files"] = {};
                    if (this.req["files"][`${field}`])
                        this.req["files"][`${field}`].push(fileObj);
                    else {
                        this.req["files"][`${field}`] = [];
                        this.req["files"][`${field}`].push(fileObj);
                    }
                }
                else if (this.for == "single") {
                    this.req["file"] = fileObj;
                }
                break;
            }

            default: throw new FormfluxError("Invalid storage option", 400);
        }
    }
}

export default setFileContentToReq;