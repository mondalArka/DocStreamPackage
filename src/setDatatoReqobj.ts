import { reqObj } from "./FormFlux.Types";
class populateReqObj {
    obj: reqObj;
    constructor(obj: reqObj) {
        this.obj = obj;
    }

    populate(): void {
        for (let i = 0; i < this.obj.metaData.length; i++) {
            {
                if (this.obj.metaData[i].includes(`filename=`)) {
                    let header = this.obj.metaData[i].split(`filename="`)[1];
                    // let fileName = header.substring(0, header.indexOf(`"`));
                    this.obj.mimeType.push(this.obj.metaData[i].split("Content-Type: ")[1]);
                    this.obj.filesize.push(Buffer.from(this.obj.content[i]).length);
                }
            }
        }
    }
}

export default populateReqObj;