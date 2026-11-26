import mongoose from "mongoose";
const userTrackingSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    siteViewed: {
        type: Boolean,
        required: true,
    },
    jobPageViewed: {
        type: Boolean,
        required: true,
    },
    reviewPageViewed: {
        type: Boolean,
        required: true,
    },
    classifiedJobPagesViewed: [
        {
            type: String,
            required: true,
        },
    ],
});
const UserTrackingModel = mongoose.model("user-trackings", userTrackingSchema);
export default UserTrackingModel;
