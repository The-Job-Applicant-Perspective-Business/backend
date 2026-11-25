import Joi from "joi";
export const generateS3UrlSchema = Joi.object({
    fileName: Joi.string().required(),
    jobId: Joi.string().optional().allow(""), // optional
});
//# sourceMappingURL=common.validation.js.map