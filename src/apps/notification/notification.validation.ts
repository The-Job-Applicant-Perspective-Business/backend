import Joi from "joi";
import { paginationValidationSchema } from "../../lib/joiSchema/pagination.validation.js";
export const notificationQueryValidationSchema = Joi.object({
    ...paginationValidationSchema,
});
