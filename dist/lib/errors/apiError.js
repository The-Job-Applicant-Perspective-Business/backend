/**
 * Represents an API error that can be handled.
 * @param {string} message - corresponding error message.
 * @param {number} statusCode - corresponding http status code.
 */
class APIError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        // this.errorCode = errorCode
        this.success = false;
    }
}
// type GenerateAPIErrorFn = (msg: string, errcode: {code: string, httpStatus: number}) => APIError;
/** Generates a custom api error with given message and status code. */
const generateAPIError = (msg, httpStatus) => {
    return new APIError(msg, httpStatus);
};
export { generateAPIError, APIError };
//# sourceMappingURL=apiError.js.map