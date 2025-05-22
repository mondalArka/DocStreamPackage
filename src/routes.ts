import { Router } from "express";
import formflux from "./docStream";
import path from "node:path";
const routes = Router();

routes.get("/doc", formflux.formHandle(
    {
        case: "bulk",
        attachFileToReq: false,
        attachFileToReqBody: false,
        filesCount: 2,
        destination: [{
            mimetype:"image/png",
            path: path.join(__dirname,"public")
        },{
            mimetype:"image/jpeg",
            path: path.join(__dirname,"temporary/other")
        }],
        filename:(req,file,cb)=>{
            if(file.mimetype=="image/png")
                cb(null,Date.now()+file.originalname);
        }
    }
));
export default routes;