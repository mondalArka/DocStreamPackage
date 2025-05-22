import { reqObj } from "./types";
import { Request } from "express";

class setContentToBody {
    private obj: reqObj;
    constructor(obj: reqObj) {
        this.obj = obj;
    }

     setBody(req: Request): void {
        req.body = req.body ? req.body : {};
        if (this.obj.contentBody.length > 0) {
            for (let i = 0; i < this.obj.contentBody.length; i++) {
                req.body[`${this.obj.fieldNameBody[i]}`] = this.obj.contentBody[i];
            }
        }
    }
}

export default setContentToBody;