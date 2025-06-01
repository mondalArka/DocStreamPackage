export default class UpperBoundary {

    static checkUpperBoundary(boundary: string, chunk: Buffer): Object {
        if (chunk.toString("binary").includes(boundary) && chunk.toString("binary").includes("\r\n"))
            return {
                data: Buffer.from(chunk.toString("binary").substring(chunk.toString("binary").indexOf("\r\n")), "binary"),
                status: "PREAMBLE"
            };
        else if (chunk.toString("binary").includes(boundary) && !chunk.toString("binary").includes("\r\n"))
            return {
                data: Buffer.from(""),
                status: "PREAMBLE"
            }
        else if (!chunk.toString("binary").includes(boundary) && chunk.toString("binary").includes("\r\n"))
            return {
                data: chunk.toString("binary").substring(chunk.toString("binary").indexOf("\r\n") + 4),
                status: "HEADER & CONTENT"
            };

        else return {
            data: chunk,
            status: "CONTENT"
        };
    }

    static checkLowerBoundary(boundary: string, chunk: Buffer): Object {
        if (chunk.toString("binary").includes(boundary + "--") && !chunk.toString("binary").includes("Content-disposition")) {
            return {
                data: Buffer.from(chunk.toString("binary").substring(0, chunk.toString("binary").indexOf(boundary + "--")), "binary"),
                status: "BOUNDARY_END"
            };
        }
        else if (chunk.toString("binary").includes(boundary + "--") && chunk.toString("binary").includes("Content-disposition")) {
            return {
                data: Buffer.from(chunk.toString("binary").substring(0, chunk.toString("binary").indexOf(boundary + "--")), "binary"),
                nextData: Buffer.from(chunk.toString("binary").substring(chunk.toString("binary").indexOf("\r\n") + 4), "binary"),
                status: "BOUNDARY_END & NEXTDATA"
            };
        }
        else if (!chunk.toString("binary").includes(boundary + "--") && chunk.toString("binary").includes("\r\n")) {
            return {
                data: Buffer.from(chunk.toString("binary").substring(0, chunk.toString("binary").indexOf("\r\n") + 4), "binary"),
                status: "HEADER & CONTENT"
            };
        }
        else
            return {
                data: chunk,
                status: "CONTENT"
            };
    }
}