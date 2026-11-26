import AdminNotificationModel from "../../models/adminNotification.model.js";
import HrNotificationModel from "../../models/hrNotification.model.js";
import JobModel from "../../models/job.model.js";
import ReviewModel from "../../models/review.model.js";
import { JOB_STATUS_ENUM, REVIEW_STATUS_ENUM, } from "../../utils/enums.utils.js";
import { getUsDateStringWithoutTime } from "../../utils/date.utils.js";
const MonthsNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];
async function createAdminNotification({ title, message, }) {
    await AdminNotificationModel.create({
        title,
        message,
        isRead: false,
    });
}
async function createHrNotification({ userId, title, message, }) {
    await HrNotificationModel.create({
        userId,
        title,
        message,
        isRead: false,
    });
}
async function createDailyAdminNotification() {
    const JobCount = await JobModel.countDocuments({
        status: JOB_STATUS_ENUM.PENDING,
    });
    const reviewCount = await ReviewModel.countDocuments({
        status: {
            $in: [
                REVIEW_STATUS_ENUM.PENDING,
                REVIEW_STATUS_ENUM.PENDING_NEW_COMPANY,
            ],
        },
    });
    // const date = getUsDateStringWithoutTime(new Date()).replace(/-/g, "/");
    const isoStringArray = getUsDateStringWithoutTime(new Date())
        .split("-")
        .map(Number);
    const date = `${MonthsNames[isoStringArray[1] - 1]} ${isoStringArray[2]}, ${isoStringArray[0]}`;
    const notificationMessage = `Job applications to be Reviewed: ${JobCount}\n Reviews to be approved: ${reviewCount}`;
    await createAdminNotification({
        title: "Daily Report - " + date,
        message: notificationMessage,
    });
}
async function createWeeklyAdminNotification() {
    const jobApplicationCount = await JobModel.countDocuments({
        createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
    });
    const reviewCount = await ReviewModel.countDocuments({
        createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
    });
    const job = await JobModel.findOne({ viewCount: { $gt: 0 } }).sort({
        viewCount: -1,
    });
    const jobViews = job?.viewCount || 0;
    const isoStringArray = getUsDateStringWithoutTime(new Date())
        .split("-")
        .map(Number);
    const date = `${MonthsNames[isoStringArray[1] - 1]} ${isoStringArray[2]}, ${isoStringArray[0]}`;
    const notificationMessage = `Here’s your summary of key metrics from the past week:\n\nJob Applications Posted: ${jobApplicationCount} new applications\nReviews Posted: ${reviewCount} new reviews\nTop Performing Job Listing: ${job?.jobTitle} with ${jobViews} views`;
    await createAdminNotification({
        title: "Weekly Report - " + date,
        message: notificationMessage,
    });
}
export { createAdminNotification, createHrNotification, createDailyAdminNotification, createWeeklyAdminNotification, };
