import { Request } from "express";
import { reqObj } from "./FormFlux.Types";

class setFileNameToBody {
    private obj: reqObj
    constructor(obj: reqObj) {
        this.obj = obj;
    }

     setFileNames(req: Request): void {
        req.body = req.body ? req.body : {};
        for (let i = 0; i < this.obj.metaData.length; i++) {
            if (this.obj.fileName.length > 1) {
                if (!req.body[`${this.obj.fieldNameFile[i]}`])
                    req.body[`${this.obj.fieldNameFile[i]}`] = this.obj.modifiedFileName[i];
                else
                    req.body[`${this.obj.fieldNameFile[i]}`] = [req.body[`${this.obj.fieldNameFile[i]}`], this.obj.modifiedFileName[i]].flat();
            }
        }
    }
}

export default setFileNameToBody;