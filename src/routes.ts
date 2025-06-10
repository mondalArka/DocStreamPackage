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
    
   Formflux.memoryStorage(
    {
        attachFileToReqBody: true,
        // maxFields:2, // optional including file fields
        // maxFileCount: 2,
        // minFileCount:2,
        // maxFileCount:3,
        // maxFileSize:900 * 1024, // a little bit bigger than the actual filsize to be filtered
        // destination: (req:Request, file:File, cb:(err:FormfluxError| null,filePath:string)=>void) => {
        //     // if(file.filesize<=(10*1024))
        //     // if (file.mimetype == "image/png")
        //     // console.log("tttt",req);
            
        //         cb(null, path.resolve(process.cwd(),"temp"));
        //     // else cb(null, path.join(__dirname, "./temporary/other"));
        // },
        filename: (req, file, cb) => {
            if (file.filesize<=(10*1024))
                cb(null, Date.now() + file.originalname);
            else cb(null, "high" + file.originalname);
        },
        // fileFilter: (req, file, cb) => { // optional
        //     if (file.mimetype=="image/jpeg" && file.fieldname=="docs")
        //         // cb(null, true);
        //     // else 
        //     cb(new FormfluxError("Not a valid type of file1111111",401), false);

        //      else cb(null,true);
        // }
    }
)
// .any()
.fields([
    {
        name:"docs",
        maxFileCount:3,
        // maxFileSize:9*1024,
        minFileCount:2
    },
    {
        name: "profile",
        // maxFileCount:3,
        // maxFileSize:1*1024
        // minFileCount:1
    }
])
// .single("docs")
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