import { Request, Router } from "express";
import Formflux from "./docStream";
import path from "node:path";
import FormfluxError from "./FormFluxError";
import asyncHandler from "./AsyncHandler";
import { File } from "./FormFlux.Types";
import { writeFileSync } from "node:fs";
const routes = Router();
const request_param= new Formflux();
routes.get("/doc/:id", 
    
   Formflux.diskStrorage(
    {
        attachFileToReqBody: true,
        // maxFields:2, // optional
        // filesCount: 3,
        // fileSize:100 * 1024, // a little bit bigger than the actual filsize to be filtered
        destination: (req:Request, file:File, cb:(err:FormfluxError| null,filePath:string)=>void) => {
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
            // if (file.filesize<=(8*1024*1024))
                cb(null, true);
            // else cb(new FormfluxError("Not a valid type of file",401), false);

            //  else cb(null,true);
        }
    }
)
.any()
// .fields([
//     {
//         name:"docs",
//         maxCount:2,
//         // filesize:10000*1024
//     },
//     {
//         name: "profile",
//         maxCount:3,
//         // filesize:100*1024
//     }
// ])
// .single("doc")
// request_param.bodyParser()
,asyncHandler(async(req,res)=>{
    console.log("body",req.body);
    console.log("query",req.query);
    console.log("params",req.params);
    console.log("file cont",req.files);
    console.log("type file",typeof req.files);
    // console.log("doc",req.file);
    
    // for(let val of req.files.docs){
    // // if(req["files"])
    //     writeFileSync(process.cwd()+"/temp/"+val["filename"],val.buffer);
    // }

    // for(let val of req.files.profile){
    // // if(req["files"])
    //     writeFileSync(process.cwd()+"/temp/"+val["filename"],val.buffer);
    // }
    
    // writeFileSync(process.cwd()+"/temp/"+req.file["filename"],req.file.buffer);
    res.json({message:"success",data:req.body});
    
    
}));

routes.use(async(err,req,res,next)=>{
    console.log("----------------------");
    console.log(err.name+"\n"+err.message+"\n"+err.stack,err["statusCode"]);
    console.log("from handler--------------------------");
    
    
    res.status(err["statusCode"]).json({message:err.message})
})
export default routes;