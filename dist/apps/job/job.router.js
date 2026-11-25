import express from "express";
import { applyActionJobController, createJobController, deleteJobController, getJobsController, updateJobController, } from "./job.controller.js";
import auth, { authOptional } from "../../lib/middleware/auth.js";
import expressWrapper from "../../lib/wrappers/expressWrapper.js";
import JoiValidator from "../../lib/middleware/joiValidator.js";
import { jobActionValidationSchema, jobCreateValidationSchema, jobQueryValidationSchema, jobUpdateValidationSchema, } from "./job.validation.js";
import JoiQueryValidator from "../../lib/middleware/joiQueryValidator.js";
import queryModifierMiddleware from "../../lib/middleware/queryModifier.js";
import expressTWrapper from "../../lib/wrappers/expressTWrapper.js";
const jobRouter = express.Router();
jobRouter.post("/", JoiValidator(jobCreateValidationSchema), auth(["hr", "admin"]), expressTWrapper(createJobController));
jobRouter.get("/", queryModifierMiddleware(["jobType", "status"]), JoiQueryValidator(jobQueryValidationSchema), authOptional(), expressWrapper(getJobsController));
// jobRouter.get(
//     "/:jobId/resumes",
//     auth(["hr", "admin"]),
//     expressWrapper(getAllResumeByJobIdController)
// )
// jobRouter.get(
//     "/:jobId/send-resumes",
//     auth(["hr", "admin"]),
//     expressWrapper(sendAllResumeByJobIdController),
// );
jobRouter.put("/:jobId", auth(["hr", "admin"]), JoiValidator(jobUpdateValidationSchema), expressWrapper(updateJobController));
jobRouter.patch("/:jobId", auth(["hr", "admin"]), JoiValidator(jobActionValidationSchema), expressWrapper(applyActionJobController));
jobRouter.delete("/:jobId", auth(["hr", "admin"]), expressTWrapper(deleteJobController));
export default jobRouter;
//# sourceMappingURL=job.router.js.map