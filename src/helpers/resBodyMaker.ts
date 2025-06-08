
export default function createNewBody(posArr:Array<string>, j:number, data:any): object {
        let current: any;
        let prev: any;
        console.log(posArr, j, "params");

        for (let i = posArr.length - 1; i >= j; i--) {
            if (!isNaN(posArr[i] as any))
                if (!prev) {
                    current = [data]
                    prev = current;
                    // console.log("new current", JSON.stringify(current, null, 2))
                }
                else {
                    current = [prev]
                    prev = current;
                    // console.log("new current", JSON.stringify(current, null, 2))
                }
            else {
                if (!prev) {
                    current = { [`${posArr[i]}`]: data };
                    prev = current;
                    // console.log(JSON.stringify(prev, null, 2), " new prev")
                    // console.log("new current1111", JSON.stringify(current, null, 2))
                }
                else {
                    current = { [`${posArr[i]}`]: prev }
                    prev = current;
                    // console.log("new prev", JSON.stringify(prev, null, 2))
                    // console.log("new current222222", JSON.stringify(current, null, 2))
                }
            }
        }
        // console.log("ulti return", current);

        return current;
    }