import { options } from "./types";

export let defaultOptions: options = {
    attachFileToReqBody: false,
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
    destination: (req, file, cb) => {
        cb(null, "");
    }
}