import { APIError } from "../errors/apiError.js";
import { Error as MError } from "mongoose";
import { StatusCodes } from "http-status-codes";
const errorHandlerMiddleware = (err, req, res, next) => {
    console.log("msg", err.message);
    let customError;
    if (err instanceof APIError) {
        customError = {
            statusCode: err.statusCode,
            // msg: "ApiError: " + err.message,
            msg: err.message,
            success: false,
        };
    }
    else if (err instanceof MError) {
        err;
        if (err.name === "ValidationError") {
            customError = {
                statusCode: StatusCodes.BAD_REQUEST,
                msg: err.message,
                // msg: "MongooseError: ValidationError: " + err.message,
                success: false,
            };
        }
        else if (err.name === "MongoError" &&
            err.code === 11000)
            customError = {
                statusCode: StatusCodes.BAD_REQUEST,
                msg: err.message,
                // msg: "MongooseError: NonUiqueError: " + err.message,
                success: false,
            };
        else if (err.name === "CastError") {
            customError = {
                statusCode: StatusCodes.NOT_FOUND,
                msg: err.message,
                // msg: "MongooseError: CastError: " + err.message,
                success: false,
            };
        }
        else {
            customError = {
                statusCode: StatusCodes.BAD_REQUEST,
                msg: err.message,
                // msg: "MongooseError: GeneralError: " + err.message,
                success: false,
            };
        }
    }
    else {
        customError = {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            msg: err.message,
            success: false,
        };
    }
    if (customError.statusCode === 500)
        console.log(err);
    return res.status(customError.statusCode).json({
        success: customError.success,
        message: customError.msg,
    });
};
export default errorHandlerMiddleware;
//# sourceMappingURL=errorHandler.js.map