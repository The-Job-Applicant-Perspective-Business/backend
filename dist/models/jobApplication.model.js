import mongoose from "mongoose";
import { JOB_APPLICATION_STATUS_ENUM } from "../utils/enums.utils.js";
const jobApplicationSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    description: String,
    resume: {
        fileName: String,
        storageName: String,
    },
    hr: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "jobs",
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(JOB_APPLICATION_STATUS_ENUM),
        default: JOB_APPLICATION_STATUS_ENUM.PENDING,
    },
}, {
    timestamps: true,
});
const JobApplicationModel = mongoose.model("job-applications", jobApplicationSchema);
export default JobApplicationModel;
//# sourceMappingURL=jobApplication.model.js.map