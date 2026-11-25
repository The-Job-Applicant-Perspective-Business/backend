import { generateAPIError } from "../errors/apiError.js";
const JoiValidator = (validationSchema) => {
    return (req, res, next) => {
        const data = req.body;
        const { error, value } = validationSchema.validate(data);
        req.body = value;
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
export default JoiValidator;
//# sourceMappingURL=joiValidator.js.map