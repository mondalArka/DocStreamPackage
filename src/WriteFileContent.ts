import { Request } from "express";
import { options, optionSingle, reqObj } from "./FormFlux.Types";
import { createWriteStream, existsSync, unlinkSync } from "fs";
import FormfluxError from "./FormFluxError";
import setFileContentToReq from "./SetFileContentToReqFile";
import EventHandlers from "./EventHandlers";
import path from "path";
import { unlink } from "fs/promises";
class writeFileContent {

    private obj: reqObj
    private options: options | optionSingle;
    private req: Request;
    private for: "any" | "fields" | "single";
    private storage: "memory" | "disk";
    constructor(req: Request, obj: reqObj, options: options | optionSingle, forReason: "any" | "fields" | "single", storage: "memory" | "disk") {
        this.obj = obj;
        this.options = options;
        this.req = req;
        this.for = forReason;
        this.storage = storage;

    }

    writeContent(): void {
        let flag = 0;
        if (this.obj.content.length > 0) {
            for (let i = 0; i < this.obj.metaData.length; i++)
                if (this.obj.metaData[i]?.length != 0 && this.obj.content[i]?.length != 0, this.obj.fileName[i]?.length != 0 && this.obj.fieldNameFile[i]?.length != 0) {
                    this.singleFile(i, this.obj.metaData[i], this.obj.content[i], this.obj.filesize[i], this.obj.fieldNameFile[i]);
                    flag++;
                }
        }
        if (flag == 0 || this.storage == "memory") {
            EventHandlers.emitMessage("writeEnd", "write finish");
        }

    }

    singleFile(count: number, metaData: string, content: Buffer, filesize: number, fieldname: string): void {
        let header = metaData.split(`filename="`)[1];
        let fileName = header.substring(0, header.indexOf(`"`));
        // this.obj.mimeType.push(metaData.split("Content-Type: ")[1]);
        let access: boolean = true;

        if (this.options.fileFilter)
            this.options.fileFilter(this.req, { originalname: fileName, mimetype: metaData.split("Content-Type: ")[1], filesize }, (error: FormfluxError | null, bool: boolean) => {
                access = this.callBackFilter(error, bool);
            })

        if (!access) throw new FormfluxError("Invalid file", 400);

        this.options.filename(this.req, { originalname: fileName, mimetype: metaData.split("Content-Type: ")[1], filesize }, (error: FormfluxError | null, fileName: string) => {
            this.callBackFilename(error, fileName);
        })

        this.obj.fileName.push(fileName);

        if (this.storage == "disk") {
            this.options["destination"](
                this.req,
                { originalname: fileName, mimetype: metaData.split("Content-Type: ")[1], filesize },
                (error: FormfluxError | null, filepath: string) => {
                    this.callBackfilepath(error, filepath);
                }
            );
        }

        if (this.for == "any") {
            new setFileContentToReq(this.req, this.obj, "any", this.storage).setFileNames(
                {
                    originalname: fileName, mimetype: metaData.split("Content-Type: ")[1],
                    filepath: this.obj.filePath[count],
                    filesize: Buffer.from(content).length,
                    filename: `${this.obj.modifiedFileName[count]}`,
                    fieldname,
                    buffer: content
                },
                null
            );
        } else if (this.for == "fields") {
            new setFileContentToReq(this.req, this.obj, "fields", this.storage).setFileNames(
                {
                    originalname: fileName, mimetype: metaData.split("Content-Type: ")[1],
                    filepath: this.obj.filePath[count],
                    filesize: Buffer.from(content).length,
                    filename: `${this.obj.modifiedFileName[count]}`,
                    fieldname,
                    buffer: content
                },
                fieldname
            );
        } else if (this.for == "single") {
            new setFileContentToReq(this.req, this.obj, "single", this.storage).setFileNames(
                {
                    originalname: fileName, mimetype: metaData.split("Content-Type: ")[1],
                    filepath: this.obj.filePath[count],
                    filesize: Buffer.from(content).length,
                    filename: `${this.obj.modifiedFileName[count]}`,
                    fieldname,
                    buffer: content
                },
                null
            );
        }
        if (!this.obj.modifiedFileName[count]) throw new FormfluxError("Filename not found", 404);
        if (this.storage == "disk" && !this.obj.filePath[count]) throw new FormfluxError("Destination path not found", 404);

        if (this.storage == "disk") {
            let writeFile = createWriteStream(this.obj.filePath[count]);
            this.obj.streams.push(writeFile);
            writeFile.write(content);
            writeFile.end();
            writeFile.on("error", (err) => {
                for (let i = 0; i < this.obj.streams.length; i++) {
                    this.obj.streams[i].destroy(err);
                    // this.obj.streams.shift();
                    console.log("into",i);
                    
                    if (existsSync(this.obj.filePath[i])) unlinkSync(this.obj.filePath[i]);
                }
                throw new Error(err.message);
            });
            writeFile.on("close", () => {
                EventHandlers.emitMessage("writeEnd", "write finish");
            });
            EventHandlers.on("parseError", () => {
                    this.obj.streams[0].destroy(
                        new FormfluxError("Error in parsing form data.Invalid Format!", 400)
                    );
                throw new FormfluxError("Error in parsing form data.Invalid Format!", 400);
            });
        }
    }

    callBackFilename(error: FormfluxError | null, fileName: string): void {
        if (error) throw error;
        this.obj.modifiedFileName.push(fileName);
    }

    callBackfilepath(error: FormfluxError | null, filepath: string): void {
        if (error) throw error;
        let len = this.obj.modifiedFileName.length;
        this.obj.filePath.push(path.resolve(filepath, `${this.obj.modifiedFileName[len - 1]}`));
    }

    callBackFilter(error: FormfluxError | null, bool: boolean): boolean {
        if (error) throw error;
        return bool;
    }
}

export default writeFileContent;
