import mongoose from "mongoose";
import { JOB_STATUS_ENUM, JOB_TYPE_ENUM, WORK_PLACE_ENUM, } from "../utils/enums.utils.js";
const jobSchema = new mongoose.Schema({
    jobTitle: {
        type: String,
        required: true,
        index: true,
    },
    jobTitleExtract: String,
    jobType: {
        type: String,
        enum: Object.values(JOB_TYPE_ENUM),
    },
    // location
    workPlaceType: {
        type: String,
        enum: Object.values(WORK_PLACE_ENUM),
    },
    jobLocation: String,
    internalJobLocation: {
        country: String,
        state: String,
        city: String,
    },
    // job description
    jobDescription: String,
    jobDescriptionExtract: String,
    // other information
    jobSalaryFrom: Number,
    jobSalaryTo: Number,
    // rejection message
    rejectionMessage: String,
    // hr
    hr: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    // application number
    applicationNumber: {
        type: Number,
        default: 0,
    },
    // view count
    viewCount: {
        type: Number,
        default: 0,
    },
    // last active date
    lastActiveDate: {
        type: Date,
        required: true,
    },
    // status
    status: {
        type: String,
        enum: Object.values(JOB_STATUS_ENUM),
        default: JOB_STATUS_ENUM.PENDING,
        required: true,
    },
}, {
    timestamps: true,
});
// Indexes
// text index for jobTitle and description
jobSchema.index({ jobDescriptionExtract: "text" });
jobSchema.index({
    "internalJobLocation.country": 1,
    "internalJobLocation.state": 1,
    "internalJobLocation.city": 1,
});
const JobModel = mongoose.model("jobs", jobSchema);
export default JobModel;
