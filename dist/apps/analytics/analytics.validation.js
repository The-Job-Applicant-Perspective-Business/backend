import joi from "joi";
import { PAGE_TYPE_ENUM } from "../../utils/enums.utils.js";
export const addAnalyticsSchema = joi.object({
    userId: joi.string().required(),
    pageType: joi
        .string()
        .required()
        .valid(...Object.values(PAGE_TYPE_ENUM)),
    jobId: joi.string().allow(null, ""),
});
export const getViewsQuerySchema = joi.object({
    startDate: joi.date().iso().allow(""),
    endDate: joi.date().iso().allow(""),
});
//# sourceMappingURL=analytics.validation.js.map