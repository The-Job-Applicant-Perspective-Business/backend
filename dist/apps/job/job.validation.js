import Joi from "joi";
import { DATED_POSTED_ENUM, JOB_API_ACTIONS_ENUM, JOB_STATUS_ENUM, JOB_TYPE_ENUM, JOBS_SELECT_OPTIONS_ENUM, WORK_PLACE_ENUM, } from "../../utils/enums.utils.js";
import { paginationValidationSchema } from "../../lib/joiSchema/pagination.validation.js";
export const jobCreateValidationSchema = Joi.object({
    jobTitle: Joi.string().required(),
    jobType: Joi.string()
        .required()
        .valid(...Object.values(JOB_TYPE_ENUM)),
    workPlaceType: Joi.string()
        .required()
        .valid(...Object.values(WORK_PLACE_ENUM)),
    jobLocation: Joi.string().when("workPlaceType", {
        is: WORK_PLACE_ENUM.ONSITE,
        then: Joi.string().required(),
        otherwise: Joi.forbidden(),
    }),
    jobDescription: Joi.string().allow(""),
    // jobResonsibilities: Joi.string().required(),
    jobSalaryFrom: Joi.number().required(),
    jobSalaryTo: Joi.number().required(),
    hr: Joi.string().optional().allow("", null),
});
export const jobUpdateValidationSchema = Joi.object({
    jobTitle: Joi.string().required(),
    jobType: Joi.string()
        .required()
        .valid(...Object.values(JOB_TYPE_ENUM)),
    workPlaceType: Joi.string()
        .required()
        .valid(...Object.values(WORK_PLACE_ENUM)),
    jobLocation: Joi.string().when("workPlaceType", {
        is: WORK_PLACE_ENUM.ONSITE,
        then: Joi.string().required(),
        otherwise: Joi.forbidden(),
    }),
    jobDescription: Joi.string().allow(""),
    // jobResonsibilities: Joi.string().required(),
    jobSalaryFrom: Joi.number().required(),
    jobSalaryTo: Joi.number().required(),
});
export const jobQueryValidationSchema = Joi.object({
    ...paginationValidationSchema,
    search: Joi.string().optional().allow(""),
    jobType: Joi.array()
        .optional()
        .items(Joi.string().valid(...Object.values(JOB_TYPE_ENUM))),
    workPlaceType: Joi.string()
        .optional()
        .valid(...Object.values(WORK_PLACE_ENUM))
        .allow(""),
    jobLocation: Joi.string().optional().allow(""),
    datePosted: Joi.string()
        .optional()
        .valid(...Object.values(DATED_POSTED_ENUM))
        .allow(""),
    jobSalary: Joi.number().optional().allow(""),
    status: Joi.array()
        .optional()
        .items(Joi.string().valid(...Object.values(JOB_STATUS_ENUM))),
    select: Joi.string()
        .optional()
        .valid(...Object.values(JOBS_SELECT_OPTIONS_ENUM), ""),
});
export const jobActionValidationSchema = Joi.object({
    action: Joi.string()
        .valid(...Object.values(JOB_API_ACTIONS_ENUM))
        .required(),
    data: Joi.any().optional(),
});
//# sourceMappingURL=job.validation.js.map