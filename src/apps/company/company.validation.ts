import Joi from "joi";
import { COMPANY_API_ACTIONS_ENUM, COMPANY_STATUS_ENUM, REVIEW_SEARCH_TYPE_ENUM, } from "../../utils/enums.utils.js";
import { paginationValidationSchema } from "../../lib/joiSchema/pagination.validation.js";
export const createCompanyValidationSchema = Joi.object({
    companyName: Joi.string().required(),
    industry: Joi.string().allow(""),
    employmentCount: Joi.string().allow(""),
    location: Joi.string().allow(""),
});
export const getCompanySearchValidationSchema = Joi.object({
    ...paginationValidationSchema,
    search: Joi.string().allow(""),
    searchType: Joi.string()
        .valid(...Object.values(REVIEW_SEARCH_TYPE_ENUM))
        .allow(""),
    status: Joi.string()
        .valid(...Object.values(COMPANY_STATUS_ENUM))
        .allow(""),
});
export const updateCompanyValidationSchema = Joi.object({
    companyName: Joi.string().required(),
    industry: Joi.string().allow(""),
    employmentCount: Joi.string().allow(""),
    location: Joi.string().allow(""),
});
export const companyActionValidationSchema = Joi.object({
    action: Joi.string()
        .valid(...Object.values(COMPANY_API_ACTIONS_ENUM))
        .required(),
    data: Joi.any().optional(),
});
