/**
 * Represents an API error that can be handled.
 * @param {string} message - corresponding error message.
 * @param {number} statusCode - corresponding http status code.
 */
class APIError extends Error {
  statusCode: number;
  success: boolean;
  errorCode?: string | number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Generates a custom api error with given message and status code. */
const generateAPIError = (msg: string, httpStatus: number): APIError => {
  return new APIError(msg, httpStatus);
};

export { generateAPIError, APIError };