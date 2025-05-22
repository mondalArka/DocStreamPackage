import EventEmitter from "node:events";
import { options, reqObj } from "./types";
import FormfluxError from "./ErrorClass";

class ExtractFileContent {
    private obj: reqObj;
    private options: options;
    private events: EventEmitter;
    constructor(obj: reqObj, options: options) {

        this.obj = obj;
        this.options = options;
    }
    extraction(): void {
        for (let val of this.obj.data) {
            if (val.includes("\r\n\r\n") && val.includes("Content-Type")) {
                const [meta, content] = val.split("\r\n\r\n");
                console.log(meta, "vallllllllpppppppppppppppppppppp");

                this.obj.fieldNameFile.push(val.split(`name="`)[1].substring(0, val.split(`name="`)[1].indexOf(`"`)));
                this.obj.content.push(Buffer.from(content, "binary"));
                this.obj.metaData.push(meta);
            } else if (!val.includes("Content-Type")) {
                console.log("in loop", val.split(`name="`)[1]);
                // console.log(start, "lpplplpl");

                this.obj.fieldNameBody.push(val.split(`name="`)[1].substring(0, val.split(`name="`)[1].indexOf(`"`)));
                this.obj.contentBody.push(val?.split("\r\n\r\n")[1].substring(0, val?.split("\r\n\r\n")[1].indexOf("\r\n")));
            }
        }

        if (this.options?.filesCount && this.obj.content.length > this.options?.filesCount) {
            throw new FormfluxError("Formfluz error: too many files", 429);
        }
    }
}

export default ExtractFileContent;