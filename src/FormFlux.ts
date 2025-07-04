import { NextFunction, Request, Response } from "express";
import { options, reqObj, optionFields, optionSingle, File } from "./FormFlux.Types";
import ExtractFileContent from "./ExtractContent";
import writeFileContent from "./WriteFileContent";
import setContentToBody from "./SetBodyContentToReq";
import setFileNameToBody from "./setFileNameToBody";
import populateReqObj from "./setDatatoReqobj";
import EventHandlers from "./EventHandlers";
import FormfluxError from "./FormFluxError";

class Formflux {

    static diskStorage(options: options) {
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
                        "filesize": [],
                        "streams": []

                    };
                    let buff: Array<Buffer> = [];
                    let reqType = req.headers["content-type"];
                    if (reqType && !reqType.includes("multipart/form-data"))
                        throw new FormfluxError("Invalid Request Type.Expected multipart/form-data", 400);

                    let boundary = req.headers["content-type"]?.split("boundary=")[1];

                    req.on("data", (chunk: Buffer) => {
                        buff.push(chunk);
                    })
                    req.on("end", () => {
                        try {
                            obj.modifiedReq = Buffer.concat(buff); // holding the concatinated buffer

                            obj.data = obj.modifiedReq.toString("binary")?.split(`--${boundary}`); // separating the boundary
                            obj.data.pop();
                            obj.data.shift();

                            //*****Defaults*****
                            //To*********extract content
                            new ExtractFileContent(obj, options, null, null).extraction();

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


                            new writeFileContent(req, obj, options, "any", "disk").writeContent();
                            if (options.attachFileToReqBody && options.attachFileToReqBody == true)
                                new setFileNameToBody(obj).setFileNames(req);

                            new setContentToBody(obj).setBody(req);

                        } catch (err) {
                            next(err);
                        }
                    })

                    req.on("error", () => {
                        next(new FormfluxError("Error in recieving request", 500));
                    })

                }
            },
            fields(optionFields: optionFields) {
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
                        "filesize": [],
                        "streams": []

                    };
                    let buff: Array<Buffer> = [];
                    let reqType = req.headers["content-type"];
                    if (reqType && !reqType.includes("multipart/form-data"))
                        throw new FormfluxError("Invalid Request Type.Expected multipart/form-data", 400);
                    let boundary = req.headers["content-type"]?.split("boundary=")[1];

                    req.on("data", (chunk: Buffer) => {
                        buff.push(chunk);
                    })
                    req.on("end", () => {
                        try {
                            obj.modifiedReq = Buffer.concat(buff); // holding the concatinated buffer

                            obj.data = obj.modifiedReq.toString("binary")?.split(`--${boundary}`); // separating the boundary
                            obj.data.pop();
                            obj.data.shift();

                            //*****Defaults*****
                            //To*********extract content
                            new ExtractFileContent(obj, options, optionFields, null).extraction();

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


                            new writeFileContent(req, obj, options, "fields", "disk").writeContent();
                            // new setFileContentToReq(obj).setFileNames(req);
                            if (options.attachFileToReqBody && options.attachFileToReqBody == true)
                                new setFileNameToBody(obj).setFileNames(req);

                            new setContentToBody(obj).setBody(req);

                        } catch (err) {
                            next(err)
                        }
                    })

                    req.on("error", () => {
                        next(new FormfluxError("Error in recieving request", 500));
                    })
                }
            },

            single(field: string) {
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
                        "filesize": [],
                        "streams": []

                    };
                    let buff: Array<Buffer> = [];
                    let reqType = req.headers["content-type"];
                    if (reqType && !reqType.includes("multipart/form-data"))
                        throw new FormfluxError("Invalid Request Type.Expected multipart/form-data", 400);
                    let boundary = req.headers["content-type"]?.split("boundary=")[1];

                    req.on("data", (chunk: Buffer) => {
                        buff.push(chunk);
                    })
                    req.on("end", () => {
                        try {
                            obj.modifiedReq = Buffer.concat(buff); // holding the concatinated buffer

                            obj.data = obj.modifiedReq.toString("binary")?.split(`--${boundary}`); // separating the boundary
                            obj.data.pop();
                            obj.data.shift();

                            //*****Defaults*****
                            //To*********extract content
                            new ExtractFileContent(obj, options, null, field).extraction();

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


                            new writeFileContent(req, obj, options, "single", "disk").writeContent();
                            if (options.attachFileToReqBody && options.attachFileToReqBody == true)
                                new setFileNameToBody(obj).setFileNames(req);

                            new setContentToBody(obj).setBody(req);
                        } catch (err) {
                            next(err);
                        }
                    })

                    req.on("error", () => {
                        next(new FormfluxError("Error in recieving request", 500));
                    })
                }
            },
        }
    }

    static memoryStorage(options: optionSingle) {
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
                        "filesize": [],
                        "streams": []

                    };
                    let buff: Array<Buffer> = [];
                    let reqType = req.headers["content-type"];
                    if (reqType && !reqType.includes("multipart/form-data"))
                        throw new FormfluxError("Invalid Request Type.Expected multipart/form-data", 400);
                    let boundary = req.headers["content-type"]?.split("boundary=")[1];

                    req.on("data", (chunk: Buffer) => {
                        buff.push(chunk);
                    })
                    req.on("end", () => {
                        try {
                            obj.modifiedReq = Buffer.concat(buff); // holding the concatinated buffer

                            obj.data = obj.modifiedReq.toString("binary")?.split(`--${boundary}`); // separating the boundary
                            obj.data.pop();
                            obj.data.shift();

                            //*****Defaults*****
                            //To*********extract content
                            new ExtractFileContent(obj, options, null, null).extraction();

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


                            new writeFileContent(req, obj, options, "any", "memory").writeContent();
                            if (options.attachFileToReqBody && options.attachFileToReqBody == true)
                                new setFileNameToBody(obj).setFileNames(req);

                            new setContentToBody(obj).setBody(req);
                        } catch (err) {
                            next(err);
                        }
                    })

                    req.on("error", () => {
                        next(new FormfluxError("Error in recieving request", 500));
                    })
                }
            },
            fields(optionFields: optionFields) {
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
                        "filesize": [],
                        "streams": []

                    };
                    let buff: Array<Buffer> = [];
                    let reqType = req.headers["content-type"];
                    if (reqType && !reqType.includes("multipart/form-data"))
                        throw new FormfluxError("Invalid Request Type.Expected multipart/form-data", 400);
                    let boundary = req.headers["content-type"]?.split("boundary=")[1];

                    req.on("data", (chunk: Buffer) => {
                        buff.push(chunk);
                    })
                    req.on("end", () => {
                        try {
                            obj.modifiedReq = Buffer.concat(buff); // holding the concatinated buffer

                            obj.data = obj.modifiedReq.toString("binary")?.split(`--${boundary}`); // separating the boundary
                            obj.data.pop();
                            obj.data.shift();

                            //*****Defaults*****
                            //To*********extract content
                            new ExtractFileContent(obj, options, optionFields, null).extraction();

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


                            new writeFileContent(req, obj, options, "fields", "memory").writeContent();
                            if (options.attachFileToReqBody && options.attachFileToReqBody == true)
                                new setFileNameToBody(obj).setFileNames(req);

                            new setContentToBody(obj).setBody(req);
                        } catch (err) {
                            next(err)
                        }
                    })

                    req.on("error", () => {
                        next(new FormfluxError("Error in recieving request", 500));
                    })
                }
            },
            single(field: string) {
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
                        "filesize": [],
                        "streams": []

                    };
                    let buff: Array<Buffer> = [];
                    let reqType = req.headers["content-type"];
                    if (reqType && !reqType.includes("multipart/form-data"))
                        throw new FormfluxError("Invalid Request Type.Expected multipart/form-data", 400);
                    let boundary = req.headers["content-type"]?.split("boundary=")[1];

                    req.on("data", (chunk: Buffer) => {
                        buff.push(chunk);
                    })
                    req.on("end", () => {
                        try {
                            obj.modifiedReq = Buffer.concat(buff); // holding the concatinated buffer

                            obj.data = obj.modifiedReq.toString("binary")?.split(`--${boundary}`); // separating the boundary
                            obj.data.pop();
                            obj.data.shift();

                            //*****Defaults*****
                            //To*********extract content
                            new ExtractFileContent(obj, options, null, field).extraction();

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

                            new writeFileContent(req, obj, options, "single", "memory").writeContent();
                            if (options.attachFileToReqBody && options.attachFileToReqBody == true)
                                new setFileNameToBody(obj).setFileNames(req);

                            new setContentToBody(obj).setBody(req);
                        } catch (err) {
                            next(err);
                        }
                    })

                    req.on("error", () => {
                        next(new FormfluxError("Error in recieving request", 500));
                    })
                }
            },
        }
    }

    bodyParser() {
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
                "filesize": [],
                "streams": []

            };
            let buff: Array<Buffer> = [];
            let reqType = req.headers["content-type"];
            if (reqType && !reqType.includes("multipart/form-data"))
                throw new FormfluxError("Invalid Request Type.Expected multipart/form-data", 400);

            let boundary = req.headers["content-type"]?.split("boundary=")[1];

            req.on("data", (chunk: Buffer) => {
                buff.push(chunk);
            })
            req.on("end", () => {
                try {
                    obj.modifiedReq = Buffer.concat(buff); // holding the concatinated buffer

                    obj.data = obj.modifiedReq.toString("binary")?.split(`--${boundary}`); // separating the boundary
                    obj.data.pop();
                    obj.data.shift();

                    //*****Defaults*****
                    //To*********extract content
                    new ExtractFileContent(obj, null, null, null).extraction();

                    //To*********SetFileDataToReqObj
                    let writeBool: boolean = false;
                    let parseBool: boolean = false;
                    let checkCompletion = (writeComplete: boolean, parsecomplete: boolean) => {
                        if (writeComplete && parsecomplete)
                            next();
                    }

                    EventHandlers.on("parseEnd", (message) => {
                        parseBool = true;
                        next();
                    })

                    new setContentToBody(obj).setBody(req);

                } catch (err) {
                    next(err);
                }
            })

            req.on("error", () => {
                next(new FormfluxError("Error in recieving request", 500));
            })
        }
    }

}

export default Formflux;
export { FormfluxError, optionFields, options, optionSingle, File };