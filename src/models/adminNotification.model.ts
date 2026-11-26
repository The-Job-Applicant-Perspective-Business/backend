import mongoose from "mongoose";
const adminNotificationSchema = new mongoose.Schema({
    // userId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     required: true,
    //     index: true,
    // },
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
        index: true,
    },
}, {
    timestamps: true,
});
const AdminNotificationModel = mongoose.model("admin-notifications", adminNotificationSchema);
export default AdminNotificationModel;
