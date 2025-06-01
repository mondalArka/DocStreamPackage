import { PassThrough, Readable, Writable } from "stream";
import FormfluxError from "./FormFluxError";
import EventEmitter from "events";

interface MultipartFileInfo {
  filename: string;
  encoding: string;
  mimeType: string;
}

class MultipartStream extends Writable {
  private config: any;
  private boundary: Buffer;
  private currentState: string;
  private matched: number = 0;

  private nextBuff: Buffer = Buffer.alloc(0);
  private headerBuffer: number[] = [];
  private bytes: Buffer[] = [];

  private fieldName: string = "";
  private filename: string = "";
  private mimetype: string = "";
  private filestream: PassThrough;

  constructor(config: any) {
    super();
    this.config = config;

    const contentType = this.config["headers"]["content-type"];
    if (!contentType.includes("multipart/form-data")) {
      throw new FormfluxError("Invalid content type", 400);
    }

    const boundaryStr = contentType.split("boundary=")[1];
    this.boundary = Buffer.from("--" + boundaryStr, "utf-8"); // prefix required
    this.currentState = "BOUNDARY";
  }

  _write(chunk: Buffer, _encoding: string, callback: (err?: Error | null) => void): void {
    this.handleData(chunk);
    callback();
  }

  _final(callback: (err?: Error | null) => void): void {
    this.handleEnd();
    callback();
  }

  private _parseHeaders(rawHeader: string): void {
    const lines = rawHeader.split("\r\n");
    for (const line of lines) {
      const [key, ...rest] = line.split(":");
      const value = rest.join(":").trim();

      if (/content-disposition/i.test(key)) {
        const nameMatch = /name="([^"]+)"/.exec(value);
        const fileMatch = /filename="([^"]+)"/.exec(value);
        this.fieldName = nameMatch?.[1] || "";
        this.filename = fileMatch?.[1] || "";
      }

      if (/content-type/i.test(key)) {
        this.mimetype = value;
      }
    }
  }

  private handleData(chunk: Buffer): void {
    // Prepend leftover buffer from last chunk
    if (this.nextBuff.length > 0) {
      chunk = Buffer.concat([this.nextBuff, chunk]);
      this.nextBuff = Buffer.alloc(0);
    }

    let i = 0;

    while (i < chunk.length) {
      const byte = chunk[i];

      if (this.currentState === "BOUNDARY") {
        if (byte === this.boundary[this.matched]) {
          this.matched++;
          if (this.matched === this.boundary.length) {
            this.matched = 0;
            this.currentState = "HEADER";
            i += 1; // Move past boundary
            continue;
          }
        } else if (this.matched > 0) {
          i -= this.matched;
          this.matched = 0;
        }
      }

      else if (this.currentState === "HEADER") {
        this.headerBuffer.push(byte);
        const len = this.headerBuffer.length;
        if (
          len >= 4 &&
          this.headerBuffer[len - 4] === 13 &&
          this.headerBuffer[len - 3] === 10 &&
          this.headerBuffer[len - 2] === 13 &&
          this.headerBuffer[len - 1] === 10
        ) {
          const rawHeader = Buffer.from(this.headerBuffer).toString();
          this._parseHeaders(rawHeader);

          this.headerBuffer = [];
          this.currentState = "PART_DATA";

          this.filestream = new PassThrough();
          this.emit("file", this.fieldName, this.filestream, {
            filename: this.filename,
            encoding: "7bit",
            mimeType: this.mimetype,
          });
        }
      }

      else if (this.currentState === "PART_DATA") {
        if (byte === this.boundary[this.matched]) {
          this.matched++;
          if (this.matched === this.boundary.length) {
            // Write buffered bytes
            if (this.bytes.length > 0) {
              this.filestream.write(Buffer.concat(this.bytes));
              this.bytes = [];
            }
            this.filestream.end();

            this.matched = 0;
            this.currentState = "HEADER";
            i += 1;
            continue;
          }
        } else {
          if (this.matched > 0) {
            const prev = Buffer.from(this.boundary.subarray(0, this.matched));
            this.bytes.push(Buffer.from(prev));
            this.matched = 0;
          }

          this.bytes.push(Buffer.from([byte]));
        }
      }

      i++;
    }

    // Save tail end of chunk in case of boundary split
    if (this.currentState === "PART_DATA") {
      const trailing = Buffer.from(chunk.subarray(chunk.length - this.boundary.length));
      this.nextBuff = trailing;
    }
  }

  private handleEnd(): void {
    if (this.filestream && this.bytes.length > 0) {
      this.filestream.write(Buffer.concat(this.bytes));
      this.filestream.end();
    }
    this.emit("finish");
  }
}

export default MultipartStream;
