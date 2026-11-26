import { APIError } from "../errors/apiError.js";
import { Error as MError } from "mongoose";
import { StatusCodes } from "http-status-codes";

const errorHandlerMiddleware = (err: any, req: any, res: any, next: any) => {
  console.log("msg", err.message);
  let customError: {
    statusCode: number;
    msg: string;
    success: boolean;
  };
  if (err instanceof APIError) {
    customError = {
      statusCode: err.statusCode,
      msg: err.message,
      success: false,
    };
  } else if (err instanceof MError) {
    if (err.name === "ValidationError") {
      customError = {
        statusCode: StatusCodes.BAD_REQUEST,
        msg: err.message,
        success: false,
      };
    } else if (
      err.name === "MongoError" &&
      (err as MError & { code?: number }).code === 11000
    ) {
      customError = {
        statusCode: StatusCodes.BAD_REQUEST,
        msg: err.message,
        success: false,
      };
    } else if (err.name === "CastError") {
      customError = {
        statusCode: StatusCodes.NOT_FOUND,
        msg: err.message,
        success: false,
      };
    } else {
      customError = {
        statusCode: StatusCodes.BAD_REQUEST,
        msg: err.message,
        success: false,
      };
    }
  } else {
    customError = {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      msg: err.message,
      success: false,
    };
  }
  if (customError.statusCode === 500) console.log(err);
  return res.status(customError.statusCode).json({
    success: customError.success,
    message: customError.msg,
  });
};

export default errorHandlerMiddleware;