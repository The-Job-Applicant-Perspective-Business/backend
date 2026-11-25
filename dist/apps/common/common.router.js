import express from "express";
import { generateS3SignedUrlController } from "./common.controller.js";
import expressWrapper from "../../lib/wrappers/expressWrapper.js";
import JoiValidator from "../../lib/middleware/joiValidator.js";
import { generateS3UrlSchema } from "./common.validation.js";
const commonRouter = express.Router();
commonRouter.post("/generate-s3-url/:fileType", JoiValidator(generateS3UrlSchema), expressWrapper(generateS3SignedUrlController));
export default commonRouter;
//# sourceMappingURL=common.router.js.map