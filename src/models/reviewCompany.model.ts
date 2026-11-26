import mongoose from "mongoose";
import { COMPANY_STATUS_ENUM } from "../utils/enums.utils.js";
const reviewCompanySchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    industry: { type: String },
    employmentCount: { type: String },
    location: { type: String },
    jobTitles: { type: [String], required: true, default: [], index: true },
    avgRating: { type: Number, required: true, default: 0 },
    reviewCount: { type: Number, required: true, default: 0 },
    status: {
        type: String,
        required: true,
        enum: Object.values(COMPANY_STATUS_ENUM),
        default: COMPANY_STATUS_ENUM.PENDING,
    },
}, {
    timestamps: true,
});
const ReviewCompanyModel = mongoose.model("review-companies", reviewCompanySchema);
export default ReviewCompanyModel;
