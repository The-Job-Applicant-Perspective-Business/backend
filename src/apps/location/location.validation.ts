import Joi from "joi";
export const searchLocationSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(200).max(1000).default(200),
    search: Joi.string().allow(""),
    country: Joi.string().allow(""),
    select: Joi.string().valid("country", "state", "city", "all", ""),
});
