import path from "path";
import { Request } from "express";
import { options, reqObj } from "./types";
import { createWriteStream } from "fs";
import FormfluxError from "./ErrorClass";
class writeFileContent {

    private obj: reqObj
    private options: options
    private req: Request;
    constructor(req:Request,obj: reqObj, options: options) {
        this.obj = obj;
        this.options = options;
        this.req= req;
    }


    writeContent(): void {
        console.log("first fileptah", this.obj.filePath);

        if (this.obj.content.length > 0) {
            let filePath: string = "";
            for (let i = 0; i < this.obj.metaData.length; i++) {
                filePath = this.checkmimeType(i);

                this.singleFile(this.obj.metaData[i], this.obj.content[i], filePath);
                
                console.log("filepath", this.obj.filePath);
                filePath = "";

            }
        }
    }

    singleFile(metaData: string,content:Buffer, filePath: string):void{
        if (metaData.includes(`filename=`)) {
            let header = metaData.split(`filename="`)[1];
            let fileName = header.substring(0, header.indexOf(`"`));
            this.obj.fileName.push(fileName);
            this.obj.mimeType.push(metaData.split("Content-Type: ")[1]);
            let writeFile = createWriteStream(filePath);
            this.obj.filePath.push(filePath);
            writeFile.write(content);
            writeFile.on("finish", () => {
                writeFile.end();
            });
        }
    }

    checkmimeType(i: number): string {
        if (this.options.destination && this.options.destination?.length > 0) {
            let s = 0;
            let e = this.options.destination.length - 1;
            while (s <= e) {
                if (this.options.destination[s].mimetype && this.options.destination[s].mimetype == this.obj.metaData[i].split("Content-Type: ")[1])
                    return this.options.destination[s].path + "/" + `${this.obj.fileName[i]}`;

                else if (!this.options.destination[s].mimetype && this.options.destination[s].path) return this.options.destination[s].path + "/" + `${this.obj.fileName[i]}`;

                if (s == e) break;

                if (this.options.destination[e].mimetype && this.options.destination[e].mimetype == this.obj.metaData[i].split("Content-Type: ")[1])
                    return this.options.destination[e].path + "/" + `${this.obj.fileName[i]}`;

                else if (!this.options.destination[e].mimetype && this.options.destination[e].path) return this.options.destination[e].path + "/" + `${this.obj.fileName[i]}`;

                s++;
                e--;

            }
        } else throw new FormfluxError("Destination path not found", 404);

        throw new FormfluxError("Destination path not found", 404);
    }
}

export default writeFileContent;
