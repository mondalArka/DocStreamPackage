import { Request } from "express";
import { options, reqObj } from "./FormFlux.Types";
import { createWriteStream } from "fs";
import FormfluxError from "./FormFluxError";
import setFileContentToReq from "./SetFileContentToReqFile";
import EventHandlers from "./EventHandlers";
import path from "path";
class writeFileContent {

    private obj: reqObj
    private options: options
    private req: Request;
    constructor(req: Request, obj: reqObj, options: options) {
        this.obj = obj;
        this.options = options;
        this.req = req;
    }

    writeContent(): void {
        let flag = 0;
        if (this.obj.content.length > 0) {
            for (let i = 0; i < this.obj.metaData.length; i++)
                if (this.obj.metaData[i]?.length != 0 && this.obj.content[i]?.length != 0, this.obj.fileName[i]?.length != 0) {
                    this.singleFile(i, this.obj.metaData[i], this.obj.content[i], this.obj.filesize[i]);
                    flag++;
                }
        }
        if (flag == 0){
            EventHandlers.emitMessage("writeEnd", "write finish");
        }

    }

    singleFile(count: number, metaData: string, content: Buffer, filesize: number): void {
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

        this.options.destination(
            this.req,
            { originalname: fileName, mimetype: metaData.split("Content-Type: ")[1], filesize },
            (error: FormfluxError | null, filepath: string) => {
                this.callBackfilepath(error, filepath);
            }
        );

        new setFileContentToReq(this.req, this.obj).setFileNames(
            {
                originalname: fileName, mimetype: metaData.split("Content-Type: ")[1],
                filepath: this.obj.filePath[count],
                filesize: Buffer.from(content).length,
                filename: `${this.obj.modifiedFileName[count]}`
            },
            "disk"
        );
        if (!this.obj.modifiedFileName[count]) throw new FormfluxError("Filename not found", 404);
        if (!this.obj.filePath[count]) throw new FormfluxError("Destination path not found", 404);

        let writeFile = createWriteStream(this.obj.filePath[count]);
        writeFile.write(content);
        writeFile.end();
        writeFile.on("error", () => {
            writeFile.end();
            throw new FormfluxError("File write error", 500);
        });
        writeFile.on("close", () => {
            EventHandlers.emitMessage("writeEnd", "write finish");
        });
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
