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
}