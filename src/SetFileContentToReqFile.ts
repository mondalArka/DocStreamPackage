import { Request } from "express";
import { reqObj } from "./FormFlux.Types";
import { log } from "node:console";

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
                    if (!Array.isArray(this.req["file"])) this.req["file"] = [];
                    fileObj["filepath"] = fileObj["filepath"];
                    this.req["file"].push(fileObj);
                }
                else if (this.for == "fields") {
                    delete fileObj["buffer"];
                    if (!this.req["file"]) this.req["file"] = {};
                    if (this.req["file"][`${field}`])
                        this.req["file"][`${field}`].push(fileObj);
                    else {
                        this.req["file"][`${field}`] = [];
                        this.req["file"][`${field}`].push(fileObj);
                    }
                }
                else if (this.for == "single") {
                    delete fileObj["buffer"];
                    this.req["file"] = fileObj;
                }
                break;
            }

            case "memory": {
                if (this.for == "any") {
                    if (!Array.isArray(this.req["file"])) this.req["file"] = [];
                    fileObj["buffer"] = fileObj["buffer"];
                    this.req["file"].push(fileObj);
                }
                else if (this.for == "fields") {
                    if (!this.req["file"]) this.req["file"] = {};
                    if (this.req["file"][`${field}`])
                        this.req["file"][`${field}`].push(fileObj);
                    else {
                        this.req["file"][`${field}`] = [];
                        this.req["file"][`${field}`].push(fileObj);
                    }
                }
                else if (this.for == "single") {
                    this.req["file"] = fileObj;
                }
                break;
            }
        }

        // else { // for any
        //     console.log("out");

        //     if(!Array.isArray(this.req["file"])) this.req["file"]=[]; 
        //     fileObj["buffer"] = fileObj["buffer"];
        //     this.req["file"].push(fileObj);
        // }




    }
}

export default setFileContentToReq;