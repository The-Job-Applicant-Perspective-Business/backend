import Joi from "joi";
import { JOB_APPLICATION_API_ACTIONS_ENUM, JOB_APPLICATION_STATUS_ENUM, } from "../../utils/enums.utils.js";
import { paginationValidationSchema } from "../../lib/joiSchema/pagination.validation.js";
export const createJobApplicationSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    description: Joi.string().allow(""),
    resume: Joi.object({
        fileName: Joi.string().required(),
        storageName: Joi.string().required(),
    })
        .optional()
        .allow(null),
});
export const getJobApplicationsSchema = Joi.object({
    ...paginationValidationSchema,
    status: Joi.string()
        .valid(...Object.values(JOB_APPLICATION_STATUS_ENUM), "")
        .optional(),
    search: Joi.string().allow("").optional(),
    jobId: Joi.string().allow("").optional(),
});
export const jobActionValidationSchema = Joi.object({
    action: Joi.string()
        .valid(...Object.values(JOB_APPLICATION_API_ACTIONS_ENUM))
        .required(),
    data: Joi.any().optional(),
});
