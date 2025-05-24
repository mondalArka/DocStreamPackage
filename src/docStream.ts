import { NextFunction, Request, Response } from "express";
import { options, reqObj } from "./types";
import ExtractFileContent from "./ExtractContent";
import writeFileContent from "./WriteFileContent";
import setContentToBody from "./SetBodyContentToReq";
import setFileNameToBody from "./setFileNameToBody";
import populateReqObj from "./setDatatoReqobj";
import EventHandlers from "./EventHandlers";
import FormfluxError from "./FormFluxError";

class formflux {
    static diskStrorage(options: options) {
        return {
            any() {
                return async function (req: Request, res: Response, next: NextFunction): Promise<void> {
                    let obj: reqObj = {
                        "originalReq": "",
                        "modifiedReq": Buffer.from(""),
                        "data": [],
                        "content": [],
                        "metaData": [],
                        "mimeType": [],
                        "fieldNameBody": [],
                        "fileName": [],
                        "modifiedFileName": [],
                        "contentBody": [],
                        "fieldNameFile": [],
                        "filePath": [],
                        "filesize": []

                    };
                    let buff: Array<Buffer> = [];
                    let boundary = req.headers["content-type"]?.split("boundary=")[1];
                    console.log("opopopopopop", boundary);

                    // console.log("objsssss", JSON.stringify(obj, null, 2));


                    req.on("data", (chunk: Buffer) => {
                        buff.push(chunk);
                    })
                    // process.nextTick(() => {
                    //     req.emit("error", new Error("Simulated stream error"));
                    // });
                    req.on("end", () => {
                        try {
                            req.file = [];

                            obj.modifiedReq = Buffer.concat(buff); // holding the concatinated buffer
                            // console.log("opopopopopop", obj.modifiedReq.toString("utf-8"),req.query,req.params["ids"]);

                            obj.data = obj.modifiedReq.toString("binary")?.split(`--${boundary}`); // separating the boundary
                            obj.data.pop();
                            obj.data.shift();
                            // console.log("data", obj.data);
                            // console.log("filename", options.filename);


                            //*****Defaults*****
                            //To*********extract content
                            new ExtractFileContent(obj, options).extraction();

                            //To*********SetFileDataToReqObj
                            new populateReqObj(obj).populate();

                            let writeBool: boolean = false;
                            let parseBool: boolean = false;
                            let checkCompletion = (writeComplete: boolean, parsecomplete: boolean) => {
                                if (writeComplete && parsecomplete)
                                    next();
                            }

                            EventHandlers.on("parseEnd", (message) => {
                                parseBool = true;
                                checkCompletion(writeBool, parseBool);
                            })

                            EventHandlers.on("writeEnd", (message) => {
                                writeBool = true;
                                checkCompletion(writeBool, parseBool);
                            })


                            new writeFileContent(req, obj, options).writeContent();
                            // new setFileContentToReq(obj).setFileNames(req);
                            if (options.attachFileToReqBody && options.attachFileToReqBody == true)
                                new setFileNameToBody(obj).setFileNames(req);

                            new setContentToBody(obj).setBody(req);



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
                            console.log("filename", obj.fileName);
                            console.log("modifiedFileName", obj.modifiedFileName);
                            console.log("filepath", obj.filePath);
                            console.log("mimeme", obj.mimeType);
                        } catch (err) {
                            next(err)
                        }
                    })

                    req.on("error", () => {
                        try {
                            console.error("Error in parsing request");
                        } catch (err) {
                            next(new FormfluxError("Error in recieving request", 500));
                        }
                    })

                }
            }
        }
    }
}

export default formflux;