import { getAuthData } from "../../utils/auth.helper.js";
import AdminNotificationModel from "../../models/adminNotification.model.js";
import HrNotificationModel from "../../models/hrNotification.model.js";
async function getNotificationsUnReadCountController(req, res) {
    const { user } = getAuthData(req);
    let unReadCount = 0;
    if (user.role === "admin") {
        unReadCount = await AdminNotificationModel.countDocuments({
            isRead: false,
        });
    }
    else {
        unReadCount = await HrNotificationModel.countDocuments({
            userId: user._id,
            isRead: false,
        });
    }
    return res.json({
        sucess: true,
        data: { unReadCount },
        message: "Notification count fetched successfully",
    });
}
async function getNotificationsController(req, res) {
    const { user } = getAuthData(req);
    const { page, limit } = req.query;
    let totalCount = 0;
    let notifications = [];
    if (user.role === "admin") {
        totalCount = await AdminNotificationModel.countDocuments({});
        notifications = await AdminNotificationModel.find({})
            .sort({
            createdAt: -1,
        })
            .skip((page - 1) * limit)
            .limit(limit);
        await AdminNotificationModel.updateMany({ isRead: false }, { $set: { isRead: true } });
    }
    else {
        totalCount = await HrNotificationModel.countDocuments({
            userId: user._id,
        });
        notifications = await HrNotificationModel.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        await HrNotificationModel.updateMany({ isRead: false }, { $set: { isRead: true } });
    }
    await HrNotificationModel.updateMany({ isRead: false }, { $set: { isRead: true } });
    return res.json({
        success: true,
        data: notifications,
        message: "Notification fetched successfully",
        total: totalCount,
        page,
        limit,
    });
}
export { getNotificationsController, getNotificationsUnReadCountController };
//# sourceMappingURL=notification.controller.js.map