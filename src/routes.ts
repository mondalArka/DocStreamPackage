import { Router } from "express";
import formflux from "./docStream";
import path from "node:path";
const routes = Router();

routes.get("/doc", formflux.diskStrorage(
    {
        attachFileToReq: false, // optional
        attachFileToReqBody: true,
        filesCount: 3,
        destination:(req,file,cb)=>{
            // if(file.mimetype=="image/png")
            if(file.mimetype=="image/png")
                cb(null,path.join(__dirname,"./public"));
            else cb(null,path.join(__dirname,"./temporary/other"));
        },
        filename:(req,file,cb)=>{
            if(file.filesize>10000)
                cb(null,Date.now()+file.originalname);
            else cb(null,"low"+file.originalname);
        }
    }
));
export default routes;