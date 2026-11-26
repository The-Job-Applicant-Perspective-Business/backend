import Joi from "joi";
import { SOCIAL_LINKS_ENUM, USER_ROLE_ENUM } from "../../utils/enums.utils.js";
import { paginationValidationSchema } from "../../lib/joiSchema/pagination.validation.js";
export const getUsersQuerySchema = Joi.object({
    ...paginationValidationSchema,
    role: Joi.string()
        .valid(...Object.values(USER_ROLE_ENUM))
        .required(),
    search: Joi.string().allow("").optional(),
});
export const createUserSchema = Joi.object({
    email: Joi.string().email().required(),
    role: Joi.string()
        .valid(...Object.values(USER_ROLE_ENUM))
        .required(),
    name: Joi.string().required(),
    companyName: Joi.string().required(),
    industry: Joi.string().required(),
    employmentCount: Joi.string().required(),
    location: Joi.string().required(),
    socialLinks: Joi.array().items(Joi.object({
        name: Joi.string()
            .required()
            .valid(...Object.values(SOCIAL_LINKS_ENUM)),
        link: Joi.string().required(),
    })),
});
export const updateUserSchema = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    companyName: Joi.string().required(),
    industry: Joi.string().required(),
    employmentCount: Joi.string().required(),
    location: Joi.string().required(),
    socialLinks: Joi.array().items(Joi.object({
        name: Joi.string()
            .required()
            .valid(...Object.values(SOCIAL_LINKS_ENUM)),
        link: Joi.string().required(),
    })),
});
