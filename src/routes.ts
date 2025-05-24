import { Request, Router } from "express";
import formflux from "./docStream";
import path from "node:path";
import FormfluxError from "./FormFluxError";
import asyncHandler from "./AsyncHandler";
import { file } from "./FormFlux.Types";
const routes = Router();

routes.get("/doc", 
    
   formflux.diskStrorage(
    {
        // attachFileToReqBody: true,
        filesCount: 3,
        // fileSize:580 * 1024, // a little bit bigger than the actual filsize to be filtered
        destination: (req:Request, file:file, cb:(err:FormfluxError| null,filePath:string)=>void) => {
            // if(file.mimetype=="image/png")
            // if (file.mimetype == "image/png")
            // console.log("tttt",req);
            
                cb(null, path.resolve(process.cwd(),"temp"));
            // else cb(null, path.join(__dirname, "./temporary/other"));
        },
        filename: (req, file, cb) => {
            // if (file.mimetype=="image/jpg")
                cb(null, Date.now() + file.originalname);
            // else cb(null, "low" + file.originalname);
        },
        fileFilter: (req, file, cb) => { // optional
            if (file.filesize<=(8*1024*1024))
                cb(null, true);
            else cb(new FormfluxError("Not a valid type of file",401), false);

            //  else cb(null,true);
        }
    }
)
// .any()
.fields([
    {
        name:"docs",
        maxCount:2
    },
    {
        name: "profile",
        maxCount:1
    }
])

,asyncHandler(async(req,res)=>{
    console.log("body",req.body);
    console.log("query",req.query);
    console.log("params",req.params);
    console.log("file",req.file);
    
    res.json({message:"success"});
    
    
}));

routes.use(async(err,req,res,next)=>{
    console.log("----------------------");
    console.log(err.name+"\n"+err.message+"\n"+err.stack,err["statusCode"]);
    console.log("from handler--------------------------");
    
    
    res.status(err["statusCode"]).json({message:err.message})
})
export default routes;