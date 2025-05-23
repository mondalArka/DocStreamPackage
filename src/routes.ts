import { Router } from "express";
import formflux from "./docStream";
import path from "node:path";
import FormfluxError from "./ErrorClass";
const routes = Router();

routes.get("/doc", formflux.diskStrorage(
    {
        attachFileToReq: false, // optional
        attachFileToReqBody: true,
        filesCount: 3,
        destination: (req, file, cb) => {
            // if(file.mimetype=="image/png")
            if (file.mimetype == "image/png")
                cb(null, path.join(__dirname, "./public"));
            else cb(null, path.join(__dirname, "./temporary/other"));
        },
        filename: (req, file, cb) => {
            if (file.filesize > 10000)
                cb(null, Date.now() + file.originalname);
            else cb(null, "low" + file.originalname);
        },
        fileFilter: (req, file, cb) => { // optional
            if (file.filesize > 200)
                cb(null, true);
            else cb(null, false);
        }
    }
));
export default routes;