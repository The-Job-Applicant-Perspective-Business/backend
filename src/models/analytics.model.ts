import mongoose from "mongoose";
const analyticsSchema = new mongoose.Schema({
    siteViews: {
        type: Number,
        default: 0,
    },
    jobPageViews: {
        type: Number,
        default: 0,
    },
    reviewPageViews: {
        type: Number,
        default: 0,
    },
    activeHrCount: {
        type: Number,
        default: 0,
    },
    analyticsDate: {
        type: String,
        required: true,
        unique: true,
    },
});
const AnalyticsModel = mongoose.model("analytics", analyticsSchema);
export default AnalyticsModel;
