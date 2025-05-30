import { PassThrough, Readable, Writable } from "stream";
import FormfluxError from "./FormFluxError";
import EventEmitter from "events";
import { createWriteStream, writeFile } from "fs";
import path from "path";
import GetHeaders from "./getHeaders";
import UpperBoundary from "./checkUpperBoundary";

interface PipeableMultipartStream extends EventEmitter {
    pipe: (req: Readable) => PipeableMultipartStream;
}
class MultipartStream extends Writable {
    private config: any;
    private req: Readable;
    private boundary: Buffer;
    private state: "PREAMBLE" | "HEADERS" | "CONTENT" | "END" | "CONTENT & HEADERS" | "NEXTDATA" | "NEXTHEADERS" | "NEXTDATA & CONTENT";
    private consumed: number = 0;
    private file: any;
    private fieldName: string;
    private filestream: PassThrough;
    private filename: string;
    private mimetype: string;
    private bytes: number;
    constructor(config: any) {
        super();
        this.config = config;
        if (!this.config["headers"]["content-type"].includes("multipart/form-data"))
            throw new FormfluxError("Invalid content type", 400);
        this.req = new Readable({ read() { } });
        this.boundary = Buffer.from("--" + this.config["headers"]["content-type"].split("boundary=")[1]);
        console.log(this.boundary.toString("binary"), "boundary");
        console.log(this.config["headers"]["content-type"].split("boundary=")[1], "accbound");
        // this.filesend = new PassThrough();
        this.filestream = new PassThrough();
        this.bytes = 0;

        // console.log(this.req,"reqqqqqqq");

    }

    // public pipe(req: Readable): this {
    //     this.req = req;
    //     this.setupEventListeners();
    //     req.pipe(this as any as Writable);
    //     return this;
    // }

    _write(chunk: Buffer, _encoding: string, callback: (err?: Error | null) => void): void {
        // Here you’d parse the chunk and emit events.
        // We'll mock the behavior for now.
        // console.log(chunk.toString("binary"),"chunk");

        this.handleData(chunk);
        callback(); // Tell Node the chunk was processed
    }

    _final(callback: (err?: Error | null) => void): void {
        this.handleEnd();
        callback(); // Done writing
    }

    private setupEventListeners(): void {
        this.req.on("data", (chunk: Buffer) => this.handleData(chunk));
        this.req.on("end", () => this.handleEnd());
        this.req.on("error", (err) => this.emit("error", new FormfluxError(`Request error: ${err.message}`, 500)));
    }

    private handleData(chunk: Buffer): void {

        let boundStat = UpperBoundary.checkUpperBoundary(this.boundary.toString("binary"), chunk);
        // console.log(typeof boundStat["data"], "boundstat");

        if (boundStat["status"] == "PREAMBLE") {
            let fieldNameStat = GetHeaders.fieldName(boundStat["data"]);
            // console.log(fieldNameStat["data"], "fieldNameStat");

            if (fieldNameStat["status"] == "HEADER_FIELDNAME") {
                let fileNameStat = GetHeaders.filename(fieldNameStat["data"]);
                // console.log(fileNameStat["data"], "fileNameStat");
                
                if (fileNameStat["status"] == "HEADER_FILENAME") {
                    let mimeTypeStat = GetHeaders.mimetype(fileNameStat["data"]);
                    if (mimeTypeStat["status"] == "HEADER_MIMETYPE") {
                        let lastBoundStat = UpperBoundary.checkLowerBoundary(this.boundary.toString("binary"), mimeTypeStat["data"]);
                        if(lastBoundStat["status"] == "BOUNDARY_END"){
                            this.filename = fileNameStat["fileName"];
                            this.mimetype = mimeTypeStat["mimeType"];
                            this.fieldName = fieldNameStat["fieldName"];
                            this.filestream = new PassThrough();
                            this.state = "CONTENT";
                            this.file = lastBoundStat["data"];
                        }
                    }
                }
            }
        }
        console.log("--------------------");
        
        // console.log(this.file, "foilesssss");

        this.emit("file", this.fieldName, this.filestream, {
            filename: this.filename,
            encoding: "7bit",
            mimeType: this.mimetype,
        });

        this.filestream.write(Buffer.from(this.file, "binary"));
    }

    private handleEnd(): void {
        this.emit("finish");
    }





}

export default MultipartStream;