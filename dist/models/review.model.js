import mongoose from "mongoose";
import { REVIEW_STATUS_ENUM } from "../utils/enums.utils.js";
const reviewSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "review-companies",
        required: true,
        index: true,
    },
    // jobType: {
    //     type: String,
    //     enum: Object.values(JOB_TYPE_ENUM),
    //     required: true,
    // },
    jobTitle: {
        type: String,
        required: true,
    },
    applicationDate: {
        type: String,
        required: true,
    },
    noOfInterviews: {
        type: Number,
        required: true,
    },
    noOfDays: {
        type: Number,
        required: true,
    },
    hiringPlatform: {
        type: String,
        required: true,
    },
    otherHiringPlatform: {
        type: String,
        required: false,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        // required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
        index: true,
        enum: Object.values(REVIEW_STATUS_ENUM),
    },
}, {
    timestamps: true,
});
const ReviewModel = mongoose.model("reviews", reviewSchema);
export default ReviewModel;
//# sourceMappingURL=review.model.js.map