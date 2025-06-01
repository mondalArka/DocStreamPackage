export default class GetHeaders {
    static filename(chunk: string): Object {
        if (chunk.includes("filename=")) {
            let header = chunk.split(`filename="`)[1];
            console.log(header,"header");
            
            let fileName = header.substring(0, header.indexOf(`"`));
            console.log("fileName",fileName);
            
            return {
                fileName,
                data: chunk.split(`filename="${fileName}"`)[1],
                status: "HEADER_FILENAME"
            };
        } else return {
            data: chunk,
            status: "CONTENT"
        };
    }


    static mimetype(chunk: string): Object {
        if (chunk.includes("Content-Type: ")) {
            let mimeType = chunk.split("Content-Type: ")[1].substring(0, chunk.split("Content-Type: ")[1].indexOf("\r\n\r\n"));
            return {
                mimeType,
                data: chunk.split(`Content-Type: ${mimeType}\r\n\r\n`)[1],
                status: "HEADER_MIMETYPE"
            };
        } else return {
            data: chunk,
            status: "CONTENT"
        };
    }

    static fieldName(chunk: string): Object {
        if (chunk.includes("name=")) {
            let fieldName = chunk.split(`name="`)[1].substring(0, chunk.split(`name="`)[1].lastIndexOf(`"`));
            return {
                fieldName,
                data: chunk.split(`name="${fieldName}";`)[1],
                status: "HEADER_FIELDNAME"
            };
        } else return {
            data: chunk,
            status: "CONTENT"
        };
    }

    static headers(boundary:string,chunk: Buffer):Object{
        if(chunk.toString("binary").includes("Content-Type") && chunk.toString("binary").includes("\r\n\r\n")){
            let filename= chunk.toString("binary").split("filename=")[1].substring(0, chunk.toString("binary").split("filename=")[1].indexOf(`"`));
            let fieldname= chunk.toString("binary").split("name=")[1].substring(0, chunk.toString("binary").split("name=")[1].indexOf(`"`));
            let mimetype= chunk.toString("binary").split("Content-Type: ")[1].substring(0, chunk.toString("binary").split("Content-Type: ")[1].indexOf("\r\n\r\n"));
            return {
                filename,
                fieldname,
                mimetype,
                data: Buffer.from(chunk.toString("binary").split(`Content-Type: ${mimetype}\r\n\r\n`)[1],"binary"),
                status: "HEADER"
            };
        }else if (!chunk.toString("binary").includes("Content-disposition") && !chunk.toString("binary").includes(boundary+"--")) {
            return {
                data: chunk,
                status: "CONTENT"
            };
        }
        else if(!chunk.toString("binary").includes("Content-disposition") && chunk.toString("binary").includes(boundary+"--")){
            return {
                data: chunk,
                status: "BOUNDARY_END"
            };
        }
        else if(!chunk.toString("binary").includes(boundary+"--") && !chunk.toString("binary").includes("\r\n") && chunk.toString("binary").includes("Content-disposition")){
            let file
            return {
                data: chunk,
                status: "HEADER"
            };
        }
        else  if(chunk.includes("Content-disposition") && !chunk.includes("Content-Type") && chunk.includes("\r\n")){
            return {
                data: Buffer.from(chunk.toString("binary").substring(chunk.toString("binary").indexOf("\r\n") + 4), "binary"),
                status: "WAIT_HEADER"
            };
        }
        else return {
            data: chunk,
            status: "CONTENT"
        };
    }
}