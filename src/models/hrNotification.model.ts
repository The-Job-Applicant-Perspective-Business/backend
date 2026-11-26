import mongoose from "mongoose";
const hrNotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
hrNotificationSchema.index({ userId: 1, isRead: 1 });
const HrNotificationModel = mongoose.model("hr-notifications", hrNotificationSchema);
export default HrNotificationModel;
