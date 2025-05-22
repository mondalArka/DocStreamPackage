import { options } from "./types";

export let defaultOptions: options = {
    case: "bulk",
    attachFileToReq: true,
    attachFileToReqBody: false,
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
    destination: [{ path: "" }]
}