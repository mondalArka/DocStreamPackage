import EventEmitter from "node:events";
import { optionFields, options, optionSingle, reqObj } from "./FormFlux.Types";
import FormfluxError from "./FormFluxError";
import { raw } from "express";

class ExtractFileContent {
    private obj: reqObj;
    private options: options | optionSingle | null
    private events: EventEmitter;
    private fieldArr: optionFields | null;
    private singleObj: string | null;
    constructor(obj: reqObj, options: options | optionSingle, fieldArr: optionFields | null, singleObj: string | null) {

        this.obj = obj;
        this.options = options;
        this.fieldArr = fieldArr;
        this.singleObj = singleObj;
    }
    extraction(): void {
        for (let val of this.obj.data) {
            if (val.includes("\r\n\r\n") && val.includes("Content-Type")) {
                const [meta, content] = val.split("\r\n\r\n");
                this.obj.fieldNameFile.push(val.split(`name="`)[1].substring(0, val.split(`name="`)[1].indexOf(`"`)));
                this.obj.content.push(Buffer.from(content, "binary"));

                if (this.options && this.options["fileSize"] && Buffer.from(content, "binary").length > this.options["fileSize"])
                    throw new FormfluxError("File size exceeded limit", 400);
                this.obj.metaData.push(meta);
            } else if (!val.includes("Content-Type")) {
                // console.log("in loop", val.split(`name="`)[1]);
                // console.log(start, "lpplplpl");

                this.obj.fieldNameBody.push(val.split(`name="`)[1].substring(0, val.split(`name="`)[1].indexOf(`"`)));
                this.obj.contentBody.push(val?.split("\r\n\r\n")[1].substring(0, val?.split("\r\n\r\n")[1].indexOf("\r\n")));
            }
        }
        // this.obj.data = []; // **************emptying*********

        // for single file checks
        if (this.singleObj) {
            let count = 0;
            for (let val of this.obj.metaData) {
                if (
                    val.includes("filename") &&
                    val.split(`name="`)[1].substring(0, val.split(`name="`)[1].indexOf(`"`)) == this.singleObj
                ) {
                    count++;
                    if (count > 1)
                        throw new FormfluxError("Too many files", 429);
                }
                else if (val.includes("filename") && val.split(`name="`)[1].substring(0, val.split(`name="`)[1].indexOf(`"`)) != this.singleObj)
                    throw new FormfluxError("Unexpected field", 400);
            }
            // if (count == 0) // if no file provided then ok
            //     throw new FormfluxError("Single file not found", 400);
        }

        if (this.fieldArr && this.fieldArr?.length != 0) {
            // console.log("start check");
            let fieldStart = 0;
            let fieldEnd = this.fieldArr.length - 1;
            let fieldObj = {};
            while (fieldStart <= fieldEnd) {
                fieldObj[`${this.fieldArr[fieldStart].name}`] = [];
                fieldObj[`${this.fieldArr[fieldStart].name}Check`] = false;
                if (fieldStart == fieldEnd) break;
                fieldObj[`${this.fieldArr[fieldEnd].name}`] = [];
                fieldObj[`${this.fieldArr[fieldEnd].name}Check`] = false;
                fieldStart++;
                fieldEnd--;
            }

            if (this.obj.metaData.length != 0) {
                let header: string;
                for (let val of this.obj.metaData) {
                    let count: number = 0;
                    if (val.includes("filename")) {
                        for (let item of this.fieldArr) {
                            header = val.split(`name="`)[1];
                            if (header.substring(0, header.indexOf(`"`)) == item.name) {
                                fieldObj[item.name].push(1);
                                count++;
                                if (item.maxCount && fieldObj[item.name].length > item.maxCount)
                                    throw new FormfluxError("Too may files", 429);

                                // each field filesize check
                                if (item.filesize && !fieldObj[`${item.name}Check`]) {
                                    let rawContent = this.obj.data.filter(x => x.includes(`name="${item.name}"`) && x.includes("Content-Type"));
                                    rawContent.forEach(cont => {

                                        if (Buffer.from(cont.split("\r\n\r\n")[1], "binary").length > item.filesize)
                                            throw new FormfluxError("File size exceeded limit1", 400);
                                    });
                                    fieldObj[`${item.name}Check`] = true;
                                }
                            }
                        }
                        if (count <= 0) throw new FormfluxError("Unexpected Field", 400); // invalid field
                    }
                }
            }
        }
        this.obj.data = null;//*******emptying*******

        //********maxFields validation*******
        console.log("mata", this.obj.fieldNameBody);
        console.log("meta2", this.obj.fieldNameFile);


        if (this.options && this.options?.maxFields) {
            let countFileFields = 0;
            let countBodyFields = 0;
            if (this.obj.fieldNameFile.length > 0) {

                let obj = {};
                for (let field of this.obj.fieldNameFile) {
                    if (!Object.keys(obj).includes(`${field}`)) {
                        obj[`${field}`] = 1;
                        countFileFields += 1;
                    }
                    else continue;
                }
                if (countFileFields > this.options.maxFields)
                    throw new FormfluxError("Too many fields", 429);
            }
            if (this.obj.fieldNameBody.length > 0) {
                let obj = {};
                for (let field of this.obj.fieldNameBody) {
                    if (!Object.keys(obj).includes(`${field}`)) {
                        obj[`${field}`] = 1;
                        countBodyFields += 1;
                    }
                    else continue;
                }
                if (countBodyFields > this.options.maxFields)
                    throw new FormfluxError("Too many fields", 429);
            }
            if (countBodyFields + countFileFields > this.options.maxFields)
                throw new FormfluxError("Too many fields", 429);
        }

        if ( this.options && this.options?.filesCount && this.obj.content.length > this.options?.filesCount) {
            throw new FormfluxError("Too many files", 429);
        }
    }
}

export default ExtractFileContent;