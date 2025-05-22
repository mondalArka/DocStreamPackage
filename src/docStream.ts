import { createReadStream, createWriteStream, glob } from "fs";
import { NextFunction, Request, Response } from "express";
import path = require("path");

const stream = async (req: Request, res: Response, next: NextFunction) => {
    let buff: Array<Buffer> = [];
    let boundary = req.headers["content-type"]?.split("boundary=")[1];
    console.log("opopopopopop", boundary);

    req.on("data", (chunk: Buffer) => {
        buff.push(chunk);
    })


    req.on("end", () => {
        interface reqObj {
            "originalReq": string;
            "modifiedReq": Buffer;
            "data": Array<string>;
            "content": Array<Buffer>,
            "contentBody": Array<string>,
            "metaData": Array<string>,
            "mimeType": Array<string>,
            "fieldNameBody": Array<string>,
            "fileName": Array<string>
            "fieldNameFile": Array<string>,
            "filePath": Array<string>,
            "filesize": Array<number>
        }
        let obj: reqObj = {
            "originalReq": "",
            "modifiedReq": Buffer.from(""),
            "data": [],
            "content": [],
            "metaData": [],
            "mimeType": [],
            "fieldNameBody": [],
            "fileName": [],
            "contentBody": [],
            "fieldNameFile": [],
            "filePath": [],
            "filesize": []

        };

        obj.modifiedReq = Buffer.concat(buff); // holding the concatinated buffer
        // console.log("opopopopopop", obj.modifiedReq.toString("utf-8"));

        obj.data = obj.modifiedReq.toString("binary")?.split(`--${boundary}`); // separating the boundary
        obj.data.pop();
        obj.data.shift();
        console.log("data", obj.data);

        //using 2 pointer looping to extract content

        for (let val of obj.data) {
            if (val.includes("\r\n\r\n") && val.includes("Content-Type")) {
                const [meta, content] = val.split("\r\n\r\n");
                console.log(meta, "vallllllll");

                obj.fieldNameFile.push(val.split(`name="`)[1].substring(0, val.split(`name="`)[1].indexOf(`"`)));
                obj.content.push(Buffer.from(content, "binary"));
                obj.metaData.push(meta);
            } else if (!val.includes("Content-Type")) {
                console.log("in loop", val.split(`name="`)[1]);
                // console.log(start, "lpplplpl");

                obj.fieldNameBody.push(val.split(`name="`)[1].substring(0, val.split(`name="`)[1].indexOf(`"`)));
                obj.contentBody.push(val?.split("\r\n\r\n")[1].substring(0, val?.split("\r\n\r\n")[1].indexOf("\r\n")));
            }
        }

        //using 2 pointer looping to write content
        if (obj.content.length > 0) {
            for (let i = 0; i < obj.metaData.length; i++) {
                {
                    if (obj.metaData[i].includes(`filename=`)) {
                        let header = obj.metaData[i].split(`filename="`)[1];
                        let fileName = header.substring(0, header.indexOf(`"`));
                        obj.fileName.push(fileName);
                        obj.mimeType.push(obj.metaData[i].split("Content-Type: ")[1]);
                        let writeFile = createWriteStream(path.join(__dirname, "./public/", `${obj.fileName[i]}`));
                        obj.filePath.push(path.join(__dirname, "./public/", `${obj.fileName[i]}`));
                        obj.filesize.push(Buffer.from(obj.content[i]).length);
                        writeFile.write(obj.content[i]);
                        writeFile.end();
                    }
                }
            }
        }
        console.log("mimes", obj.mimeType);
        console.log("fileNames", obj.fileName);
        console.log("contentBody", obj.contentBody);
        console.log("contentField", obj.fieldNameBody);
        console.log("contentFileBody", obj.fieldNameFile);

        req.body = {}; // set the body to blank object

        // set to body for content body
        if (obj.contentBody.length > 0) {
            let s = 0;
            let e = obj.contentBody.length - 1;
            for (let i = 0; i < obj.contentBody.length; i++) {
                req.body[`${obj.fieldNameBody[s]}`] = obj.contentBody[s];
                if (s == e) break;
                req.body[`${obj.fieldNameBody[e]}`] = obj.contentBody[e];
                s++;
                e--;
            }
        }

        // set to body for content file
        if (obj.metaData.length > 0) {
            let s = 0;
            let e = obj.metaData.length - 1;
            for (let i = 0; i < obj.metaData.length; i++) {
                if (obj.fileName.length > 1) {
                    if(!req.body[`${obj.fieldNameFile[i]}`])
                    req.body[`${obj.fieldNameFile[i]}`] = obj.fileName[i];
                    else{
                    req.body[`${obj.fieldNameFile[i]}`] = [req.body[`${obj.fieldNameFile[i]}`], obj.fileName[i]].flat();
                    }
                    req["file"] = req["file"] ? [...req["file"]] : [];
                    req["file"].push({
                        originalname: obj.fileName[i],
                        mimetype: obj.mimeType[i],
                        filepath: obj.filePath[i],
                        filesize: obj.filesize[i]
                    });
                } else
                    req.body[`${obj.fieldNameFile[i]}`] = obj.fileName[i];

            }
        }
        console.log("req.body", req.body);
        console.log("file", req["file"]);
        console.log("filesize", obj.filesize);




        res.json({ message: "Success" });
    })
}

export default stream;