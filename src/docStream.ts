import { NextFunction, Request, Response } from "express";
import { options, reqObj } from "./types";
import ExtractFileContent from "./ExtractContent";
import writeFileContent from "./WriteFileContent";
import setContentToBody from "./SetBodyContentToReq";
import setFileContentToReq from "./SetFileContentToReqFile";
import setFileNameToBody from "./setFileNameToBody";
import { defaultOptions } from "./defaultOptions";
import populateReqObj from "./setDatatoReqobj";

class formflux {
    static formHandle(options: options = defaultOptions) {
        return async function (req: Request, res: Response, next: NextFunction) {
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
            let buff: Array<Buffer> = [];
            let boundary = req.headers["content-type"]?.split("boundary=")[1];
            console.log("opopopopopop", boundary);

            console.log("objsssss", JSON.stringify(obj, null, 2));


            req.on("data", (chunk: Buffer) => {
                buff.push(chunk);
            })
            req.on("end", () => {

                obj.modifiedReq = Buffer.concat(buff); // holding the concatinated buffer
                // console.log("opopopopopop", obj.modifiedReq.toString("utf-8"));

                obj.data = obj.modifiedReq.toString("binary")?.split(`--${boundary}`); // separating the boundary
                obj.data.pop();
                obj.data.shift();
                console.log("data", obj.data);
                console.log("filename", options.filename);


                //*****Defaults*****
                //To*********extract content
                new ExtractFileContent(obj, options).extraction();

                //To*********SetFileDataToReqObj
                new populateReqObj(obj).populate();


                switch (options.case) {
                    case "bulk": {
                        new writeFileContent(req,obj, options).writeContent();
                        new setFileContentToReq(obj).setFileNames(req);
                        if (options.attachFileToReqBody && options.attachFileToReqBody == true)
                            new setFileNameToBody(obj).setFileNames(req);

                        new setContentToBody(obj).setBody(req);
                        break;
                    }
                    case "stream": {
                        console.log("stream");
                        break;
                    }

                    default:
                        console.error("Invalid option");
                        break;
                }


                // console.log("mimes", obj.mimeType);
                // console.log("fileNames", obj.fileName);
                // console.log("contentBody", obj.contentBody);
                // console.log("contentField", obj.fieldNameBody);
                // console.log("contentFileBody", obj.fieldNameFile);
                // console.log("content",obj.content);



                //********optinals***********

                //*****To write content*******
                // new writeFileContent(obj).writeContent();

                // console.log("mimes", obj.mimeType);
                // console.log("fileNames", obj.fileName);
                // console.log("contentBody", obj.contentBody);
                // console.log("contentField", obj.fieldNameBody);
                // console.log("contentFileBody", obj.fieldNameFile);

                // set to body for content body
                // new setContentToBody(obj).setBody(req);

                // set to Req for content file
                // new setFileContentToReq(obj).setFileNames(req);

                //Set fileName to req.body
                // new setFileNameToBody(obj).setFileNames(req);


                console.log("req.body", req.body);
                console.log("file", req["file"]);
                console.log("filesize", obj.filesize);
                console.log("meta", obj.metaData);

                res.json({ message: "Success" });
            })
        }
    }
}

export default formflux;