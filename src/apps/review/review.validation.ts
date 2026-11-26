import Joi from "joi";
import { DATED_POSTED_ENUM, 
// JOB_TYPE_ENUM,
REVIEW_API_ACTIONS_ENUM, REVIEW_STATUS_ENUM, } from "../../utils/enums.utils.js";
import { paginationValidationSchema } from "../../lib/joiSchema/pagination.validation.js";
const dateIsoRegex = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;
export const createReviewSchema = Joi.object({
    company: Joi.string().required(),
    // jobType: Joi.string()
    //     .valid(...Object.values(JOB_TYPE_ENUM))
    //     .required(),
    jobTitle: Joi.string().required(),
    applicationDate: Joi.string().regex(dateIsoRegex).allow(""),
    noOfInterviews: Joi.number().integer().min(0).required(),
    noOfDays: Joi.number().integer().min(0).required(),
    hiringPlatform: Joi.string().required(),
    otherHiringPlatform: Joi.string().allow(""),
    title: Joi.string().required(),
    description: Joi.string().allow(""),
    rating: Joi.number().integer().min(1).max(5).required(),
});
export const updateReviewSchema = Joi.object({
    company: Joi.string().allow(""),
    companyName: Joi.string().allow(""),
    industry: Joi.string().allow(""),
    employmentCount: Joi.string().allow(""),
    location: Joi.string().allow(""),
    // jobType: Joi.string()
    //     .valid(...Object.values(JOB_TYPE_ENUM))
    //     .required(),
    jobTitle: Joi.string().required(),
    applicationDate: Joi.string().regex(dateIsoRegex).allow(""),
    noOfInterviews: Joi.number().integer().min(0).required(),
    noOfDays: Joi.number().integer().min(0).required(),
    hiringPlatform: Joi.string().required(),
    otherHiringPlatform: Joi.string().allow(""),
    title: Joi.string().required(),
    description: Joi.string().allow(""),
    rating: Joi.number().integer().min(1).max(5).required(),
    // status: Joi.string()
    //     .valid(
    //         REVIEW_STATUS_ENUM.PENDING,
    //         REVIEW_STATUS_ENUM.PENDING_NEW_COMPANY,
    //     )
    //     .default(REVIEW_STATUS_ENUM.PENDING),
});
export const reviewQuerySchema = Joi.object({
    ...paginationValidationSchema,
    companyId: Joi.string().allow(""),
    // jobType: Joi.string()
    //     .valid(...Object.values(JOB_TYPE_ENUM))
    //     .allow(""),
    jobTitle: Joi.string().allow(""),
    search: Joi.string().allow(""),
    rating: Joi.number().integer().min(0).max(5).allow(""),
    datePosted: Joi.string()
        .valid(...Object.values(DATED_POSTED_ENUM))
        .allow(""),
    status: Joi.array()
        .optional()
        .items(Joi.string().valid(...Object.values(REVIEW_STATUS_ENUM))),
});
export const reviewActionValidationSchema = Joi.object({
    action: Joi.string()
        .valid(...Object.values(REVIEW_API_ACTIONS_ENUM))
        .required(),
    data: Joi.any().optional(),
});
