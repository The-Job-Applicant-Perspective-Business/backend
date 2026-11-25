import express from "express";
import expressWrapper from "../../lib/wrappers/expressWrapper.js";
import { createReviewController, getReviewsController, applyActionReviewController, deleteReviewController, updateReviewController, } from "./review.controller.js";
import expressTWrapper from "../../lib/wrappers/expressTWrapper.js";
import auth, { authOptional } from "../../lib/middleware/auth.js";
import JoiValidator from "../../lib/middleware/joiValidator.js";
import { createReviewSchema, reviewActionValidationSchema, reviewQuerySchema, updateReviewSchema, } from "./review.validation.js";
import JoiQueryValidator from "../../lib/middleware/joiQueryValidator.js";
import queryModifierMiddleware from "../../lib/middleware/queryModifier.js";
const reviewRouter = express.Router();
reviewRouter.post("/", JoiValidator(createReviewSchema), authOptional(), expressTWrapper(createReviewController));
reviewRouter.get("/", queryModifierMiddleware(["status"]), JoiQueryValidator(reviewQuerySchema), authOptional(), expressWrapper(getReviewsController));
reviewRouter.put("/:reviewId", JoiValidator(updateReviewSchema), auth("admin"), expressTWrapper(updateReviewController));
reviewRouter.patch("/:reviewId", auth("admin"), JoiValidator(reviewActionValidationSchema), expressTWrapper(applyActionReviewController));
reviewRouter.delete("/:reviewId", auth("admin"), expressTWrapper(deleteReviewController));
export default reviewRouter;
//# sourceMappingURL=review.router.js.map