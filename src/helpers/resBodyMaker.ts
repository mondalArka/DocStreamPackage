
export default function createNewBody(posArr:Array<string>, j:number, data:any): object {
        let current: any;
        let prev: any;

        for (let i = posArr.length - 1; i >= j; i--) {
            if (!isNaN(posArr[i] as any))
                if (!prev) {
                    current = [data]
                    prev = current;
                }
                else {
                    current = [prev]
                    prev = current;
                }
            else {
                if (!prev) {
                    current = { [`${posArr[i]}`]: data };
                    prev = current;
                }
                else {
                    current = { [`${posArr[i]}`]: prev }
                    prev = current;
                }
            }
        }
        return current;
    }