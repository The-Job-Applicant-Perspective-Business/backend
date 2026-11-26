import Joi from "joi";
import { USER_ROLE_ENUM } from "../../utils/enums.utils.js";
export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string()
        .valid(...Object.values(USER_ROLE_ENUM))
        .required(),
});
export const signupSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string()
        .valid(...Object.values(USER_ROLE_ENUM))
        .required(),
    name: Joi.string().required(),
    companyName: Joi.string().required(),
    industry: Joi.string().required(),
    employmentCount: Joi.string().required(),
    location: Joi.string().required(),
});
export const checkEmailSchema = Joi.object({
    email: Joi.string().email().required(),
});
export const forgotPasswordStartSchema = Joi.object({
    email: Joi.string().email().required(),
    role: Joi.string()
        .valid(...Object.values(USER_ROLE_ENUM))
        .required(),
});
export const forgotPasswordCompleteSchema = Joi.object({
    email: Joi.string().email().required(),
    forgotUuid: Joi.string().required(),
    password: Joi.string().required(),
});
