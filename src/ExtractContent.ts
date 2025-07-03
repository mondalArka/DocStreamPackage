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

                if (this.options && this.options["maxFileSize"] && Buffer.from(content, "binary").length > this.options["maxFileSize"])
                    throw new FormfluxError("File size exceeded limit", 400);
                this.obj.metaData.push(meta);
            } else if (!val.includes("Content-Type")) {
                this.obj.fieldNameBody.push(val.split(`name="`)[1].substring(0, val.split(`name="`)[1].indexOf(`"`)));
                this.obj.contentBody.push(val?.split("\r\n\r\n")[1].substring(0, val?.split("\r\n\r\n")[1].indexOf("\r\n")));
            }
        }

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
        }
        // check maxfileCount
        if (this.options && this.options?.maxFileCount) {
            if (this.options.minFileCount && this.options.minFileCount > this.options.maxFileCount)
                throw new FormfluxError("minFileCount should be less than maxFileCount", 500);

            if (this.obj.content.length > this.options?.maxFileCount)
                throw new FormfluxError("Too many files", 429);
        }

        //check minfileCount
        if (this.options && this.options?.minFileCount) {
            if (this.options.maxFileCount < this.options.minFileCount)
                throw new FormfluxError("minFileCount should be less than maxFileCount", 500);

            if (this.obj.content.length < this.options?.minFileCount)
                throw new FormfluxError(`At least ${this.options?.minFileCount} file(s) required`, 400);
        }

        //check each fields
        if (this.fieldArr && this.fieldArr?.length != 0) {
            let fieldStart = 0;
            let fieldEnd = this.fieldArr.length - 1;
            let fieldObj = {};
            let isCountField: boolean = false;
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

                                // check if min is greater then max count
                                if (item.minFileCount && item.maxFileCount && item.maxFileCount < item.minFileCount)
                                    throw new FormfluxError("minFileCount should be less than maxFileCount", 500);

                                if (item.maxFileCount && fieldObj[item.name].length > item.maxFileCount)
                                    throw new FormfluxError("Too may files", 429);

                                // set the minCountfield
                                if (item.minFileCount && !fieldObj[`${item.name}minCount`]) {
                                    isCountField = true;
                                }

                                // each field filesize check
                                if (item.maxFileSize && !fieldObj[`${item.name}Check`]) {
                                    let rawContent = this.obj.data.filter(x => x.includes(`name="${item.name}"`) && x.includes("Content-Type"));
                                    rawContent.forEach(cont => {

                                        if (Buffer.from(cont.split("\r\n\r\n")[1], "binary").length > item.maxFileSize)
                                            throw new FormfluxError("File size exceeded limit", 400);
                                    });
                                    fieldObj[`${item.name}Check`] = true;
                                }
                            }
                        }
                        if (count <= 0) throw new FormfluxError("Unexpected Field", 400); // invalid field
                    }
                }

                if (isCountField) {
                    let i = 0;
                    let filterKeyVals = Object.entries(fieldObj).filter(x => !x[0].includes("Check"));
                    for (let i = 0; i < filterKeyVals.length; i++) {
                        if (this.fieldArr[i].minFileCount && filterKeyVals[i][1]["length"] < this.fieldArr[i].minFileCount)
                            throw new FormfluxError(`At least ${this.fieldArr[i].minFileCount} file(s) required for ${this.fieldArr[i].name} field`, 400);
                    }
                }
            }
        }
        this.obj.data = null;//*******emptying*******

        //********maxFields validation*******
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
    }
}

export default ExtractFileContent;