export default class UpperBoundary {

    static checkUpperBoundary(boundary: string, chunk: Buffer): Object {
        if (chunk.toString("binary").startsWith(boundary))
            return {
                data: chunk.toString("binary").slice(boundary.length),
                status: "PREAMBLE"
            };

        return {
            data: chunk.toString("binary"),
            status: "CONTENT"
        };
    }

    static checkLowerBoundary(boundary: string, chunk: Buffer): Object {
        if (chunk.toString("binary").includes(boundary+"--")){
            return {
                data: chunk.toString("binary").split(boundary+"--")[0],
                status: "BOUNDARY_END"
            };
        }

        return {
            data: chunk.toString("binary"),
            status: "CONTENT"
        };
    }
}