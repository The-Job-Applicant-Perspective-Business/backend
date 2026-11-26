import express from "express";
import { searchLocationController } from "./location.controller.js";
import JoiQueryValidator from "../../lib/middleware/joiQueryValidator.js";
import { searchLocationSchema } from "./location.validation.js";
import expressWrapper from "../../lib/wrappers/expressWrapper.js";
const locationRouter = express.Router();
locationRouter.get("/search", JoiQueryValidator(searchLocationSchema), expressWrapper(searchLocationController));
export default locationRouter;
