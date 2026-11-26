import { generateAPIError } from "../errors/apiError.js";
const JoiQueryValidator = (validationSchema) => {
    return (req, res, next) => {
        const query = req.query;
        const { error, value } = validationSchema.validate(query);
        req.query = value;
        if (error) {
            const message = error.details
                .map((err) => err.message)
                .join(", ");
            return next(generateAPIError(message, 400));
        }
        else {
            return next();
        }
    };
};
export default JoiQueryValidator;
