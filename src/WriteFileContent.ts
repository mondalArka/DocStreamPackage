import { Request } from "express";
import { options, reqObj } from "./types";
import { createWriteStream } from "fs";
import FormfluxError from "./ErrorClass";
import setFileContentToReq from "./SetFileContentToReqFile";
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
        if (this.obj.content.length > 0) {
            let filePath: string = "";
            for (let i = 0; i < this.obj.metaData.length; i++) {

                this.singleFile(i, this.obj.metaData[i], this.obj.content[i], filePath, this.obj.filesize[i]);

                filePath = "";
            }
        }
    }

    singleFile(count: number, metaData: string, content: Buffer, filePath: string, filesize: number): void {
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
        writeFile.on("error", () => {
            throw new FormfluxError("File write error", 500);
        });
        writeFile.on("finish", () => {
            writeFile.end();
        });
    }

    callBackFilename(error: FormfluxError | null, fileName: string): void {
        if (error) throw error;
        this.obj.modifiedFileName.push(fileName);
    }

    callBackfilepath(error: FormfluxError | null, filepath: string): void {
        if (error) throw error;
        let len = this.obj.modifiedFileName.length;
        this.obj.filePath.push(filepath + "/" + `${this.obj.modifiedFileName[len - 1]}`);
    }

    callBackFilter(error: FormfluxError | null, bool: boolean): boolean {
        if (error) throw error;
        return bool;
    }
}

export default writeFileContent;
