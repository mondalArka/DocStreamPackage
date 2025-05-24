import EventEmitter from "node:events";
import { optionFields, options, reqObj } from "./FormFlux.Types";
import FormfluxError from "./FormFluxError";

class ExtractFileContent {
    private obj: reqObj;
    private options: options
    private events: EventEmitter;
    private fieldArr: optionFields | null;
    constructor(obj: reqObj, options: options, fieldArr: optionFields | null) {

        this.obj = obj;
        this.options = options;
        this.fieldArr = fieldArr
    }
    extraction(): void {
        for (let val of this.obj.data) {
            if (val.includes("\r\n\r\n") && val.includes("Content-Type")) {
                const [meta, content] = val.split("\r\n\r\n");
                this.obj.fieldNameFile.push(val.split(`name="`)[1].substring(0, val.split(`name="`)[1].indexOf(`"`)));
                this.obj.content.push(Buffer.from(content, "binary"));

                if (this.options["fileSize"] && Buffer.from(content, "binary").length > this.options["fileSize"])
                    throw new FormfluxError("File size exceeded limit", 400);
                this.obj.metaData.push(meta);
            } else if (!val.includes("Content-Type")) {
                // console.log("in loop", val.split(`name="`)[1]);
                // console.log(start, "lpplplpl");

                this.obj.fieldNameBody.push(val.split(`name="`)[1].substring(0, val.split(`name="`)[1].indexOf(`"`)));
                this.obj.contentBody.push(val?.split("\r\n\r\n")[1].substring(0, val?.split("\r\n\r\n")[1].indexOf("\r\n")));
            }
        }
        this.obj.data=[]; // **************emptying*********

        if (this.fieldArr && this.fieldArr?.length != 0) {
            // console.log("start check");
            let fieldStart = 0;
            let fieldEnd = this.fieldArr.length - 1;
            let fieldObj = {};
            while (fieldStart <= fieldEnd) {
                fieldObj[`${this.fieldArr[fieldStart].name}`] = [];
                if (fieldStart == fieldEnd) break;
                fieldObj[`${this.fieldArr[fieldEnd].name}`] = [];
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
                                if (fieldObj[item.name].length > item.maxCount) throw new FormfluxError("Too may files",429)
                            }
                        }
                        if (count <= 0) throw new FormfluxError("Unexpected Field", 400); // invalid field
                    }
                }
            }
        }

        if (this.options?.filesCount && this.obj.content.length > this.options?.filesCount) {
            throw new FormfluxError("Too many files", 429);
        }
    }
}

export default ExtractFileContent;