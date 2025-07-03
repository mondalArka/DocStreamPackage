import { Request } from "express";
import { reqObj } from "./FormFlux.Types";
import createNewBody from "./helpers/resBodyMaker";
import { unlinkSync, existsSync } from "fs";
import EventHandlers from "./EventHandlers";
import FormfluxError from "./FormFluxError";

class setFileNameToBody {
    private obj: reqObj
    constructor(obj: reqObj) {
        this.obj = obj;
    }

    setFileNames(req: Request): void {
        try {
            req.body = req.body ? req.body : {};
            for (let i = 0; i < this.obj.metaData.length; i++) {
                if (this.obj.fileName.length > 0) {

                    if (/\[.*\]/.test(this.obj.fieldNameFile[i])) {
                        this.nestedData(req, this.obj.fieldNameFile[i], this.obj.fileName[i]);
                    } 
                    if (!req.body[`${this.obj.fieldNameFile[i]}`] && !/\[.*\]/.test(this.obj.fieldNameFile[i]))
                        req.body[`${this.obj.fieldNameFile[i]}`] = this.obj.modifiedFileName[i];
                    else if (req.body[`${this.obj.fieldNameFile[i]}`] && !/\[.*\]/.test(this.obj.fieldNameFile[i]))
                        req.body[`${this.obj.fieldNameFile[i]}`] = [req.body[`${this.obj.fieldNameFile[i]}`], this.obj.modifiedFileName[i]].flat();
                }
            }
        } catch (err) {
            console.log(err);
            EventHandlers.emit("parseError",{message:"Error in parsing form data.Invalid Format!",code:400});
        }
    }

    nestedData(req: Request, fieldName: string, data: any) {
        let outer = fieldName.substring(0, fieldName.indexOf("["));
        let inners = fieldName.substring(fieldName.indexOf("["));
        let i = 0;
        let current: any;
        let prev: any;
        let temp = inners.match(/\[([^\]]+)\]/g).map(s => s.slice(1, -1)); // [a,b,c] => [a,b,c]
        if (!req.body[`${outer}`]) {
            for (let i = temp.length - 1; i >= 0; i--) {
                if (!isNaN(temp[i] as any)) {
                    if (!prev) {
                        current = [data]
                        prev = current;
                    }
                    else {
                        current = [prev]
                        prev = current;
                    }
                }
                else {
                    if (!prev) {
                        current = { [`${temp[i]}`]: data };
                        prev = current;
                    }
                    else {
                        current = { [`${temp[i]}`]: prev }
                        prev = current;
                    }
                }
            }
            req.body[`${outer}`] = current;
        }
        else {
            temp.unshift(outer);
            this.getNestedField(req, req.body, temp, temp[temp.length - 1], data, 0, req.body);
        }
    }

    // mapping.....
    getNestedField(req: Request, obj: object, posArr: Array<any>, keySearch: any, data: any, i: number, prevObj: object) {
        if (i == posArr.length - 1) {  // reached last position set the value
            if (Array.isArray(obj)) {
                if (!isNaN(posArr[i])) { // if the current position is a number then it is an array
                    obj[posArr[i]] ? obj[posArr[i]] = data : obj.push(data);
                    return;
                } else {
                    obj[posArr[i]] = data // needs some checking
                    return;
                }
            } else { // it is an objct
                obj[posArr[i]] = data;
                return;
            }
        }

        if (!obj[posArr[i]]) {
            if (!isNaN(posArr[i])) {
                obj[posArr[i]] = createNewBody(posArr, i + 1, data); // create the rest
                return;
            }
            else {
                obj[posArr[i]] = createNewBody(posArr, i + 1, data);
                return;
            }
        }
        prevObj = obj[posArr[i]];
        this.getNestedField(req, obj[posArr[i]], posArr, keySearch, data, i + 1, prevObj);
    }

}

export default setFileNameToBody;