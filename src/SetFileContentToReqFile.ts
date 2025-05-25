import { Request } from "express";
import { reqObj } from "./FormFlux.Types";
import { log } from "node:console";

class setFileContentToReq {
    private obj: reqObj;
    private req: Request;
    private for: "any" | "fields";
    constructor(req: Request, obj: reqObj, forReason: "any" | "fields") {
        this.req = req;
        this.obj = obj;
        this.for = forReason;
    }

    setFileNames(fileObj: any, type: string, field: string | null): void {
        if (type == "disk" && this.for == "any") {
            console.log("in");
            
            if(!Array.isArray(this.req["file"])) this.req["file"]=[]; 
            // this.req["file"]=[];
            fileObj["filepath"] = fileObj["filepath"];
            this.req["file"].push(fileObj);
        }
        else if (type == "disk" && this.for == "fields") {
            if(!this.req["file"]) this.req["file"]={}; 
            if(this.req["file"][`${field}`])
                this.req["file"][`${field}`].push(fileObj);
            else{
                this.req["file"][`${field}`]=[];
                this.req["file"][`${field}`].push(fileObj);
            }
        }

        else { // for any
            console.log("out");
            
            if(!Array.isArray(this.req["file"])) this.req["file"]=[]; 
            fileObj["buffer"] = fileObj["buffer"];
            this.req["file"].push(fileObj);
        }




    }
}

export default setFileContentToReq;