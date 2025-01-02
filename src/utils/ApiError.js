class ApiError extends Error {
    constructor(
        stausCode = 500,
        message = 'Something went wrong',
        errors = [],
            ){
        super(message);
        this.stausCode = stausCode;
        this.data = null
        this.message = message,
        this.success = false;
        this.errors = errors


    }
}

export {ApiError}