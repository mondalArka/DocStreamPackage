class FormfluxError extends Error {
    private statusCode: number;
    constructor(message: string,statusCode: number=500) {
        super(message);
        this.name = "FormfluxError";
        this.statusCode=statusCode;
    }
}


export default FormfluxError;



