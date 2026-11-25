import { generateAPIError } from "../../lib/errors/apiError.js";
import ConsecutiveTaskQueueInit from "../../lib/taskQueue.lib.js";
import AnalyticsModel from "../../models/analytics.model.js";
import JobModel from "../../models/job.model.js";
import UserModel from "../../models/user.model.js";
import UserTrackingModel from "../../models/userTracking.model.js";
import { getUsDateStringWithoutTime } from "../../utils/date.utils.js";
async function ResetTrackingData() {
    // daily removes all user tracking data
    await UserTrackingModel.deleteMany({});
    // reset hrSigninCount for all hr users
    await UserModel.updateMany({
        role: "hr",
    }, {
        $set: {
            isHrActiveToday: false,
        },
    });
}
async function IncrementPageViewCount({ userId, pageType, jobId, }) {
    let userTracking = await UserTrackingModel.findOne({
        userId,
    });
    if (!userTracking) {
        userTracking = await UserTrackingModel.create({
            userId,
            siteViewed: false,
            jobPageViewed: false,
            reviewPageViewed: false,
            classifiedJobPagesViewed: [],
        });
    }
    const date = new Date();
    // america new york uses est time
    const usEastTime = new Date().toLocaleString("en-GB", {
        timeZone: "America/New_York",
    });
    // convert into yyyy-mm-dd format
    const dateString = usEastTime.split(",")[0].split("/").reverse().join("-");
    let analytics = await AnalyticsModel.findOne({ analyticsDate: dateString });
    if (!analytics) {
        analytics = await AnalyticsModel.create({
            analyticsDate: dateString,
        });
    }
    if (!userTracking.siteViewed) {
        analytics.siteViews += 1;
        userTracking.siteViewed = true;
    }
    switch (pageType) {
        case "other":
            // site view is already counted above
            break;
        case "classified":
            if (!userTracking.jobPageViewed) {
                analytics.jobPageViews += 1;
                userTracking.jobPageViewed = true;
            }
            break;
        case "review":
            if (!userTracking.reviewPageViewed) {
                analytics.reviewPageViews += 1;
                userTracking.reviewPageViewed = true;
            }
            break;
        case "job":
            if (!userTracking.jobPageViewed) {
                analytics.jobPageViews += 1;
                userTracking.jobPageViewed = true;
            }
            if (jobId &&
                !userTracking.classifiedJobPagesViewed.includes(jobId)) {
                const job = await JobModel.findOne({ _id: jobId });
                if (job) {
                    job.viewCount += 1;
                    userTracking.classifiedJobPagesViewed.push(jobId);
                    await job.save();
                }
            }
            break;
        default:
            throw generateAPIError("Invalid page type", 400);
    }
    await analytics.save();
    await userTracking.save();
}
async function IncrementActiveHrCount(hrId) {
    const user = await UserModel.findOne({ _id: hrId });
    if (!user) {
        throw new Error("User not found in the hr increment active count");
    }
    if (user.isHrActiveToday) {
        return;
    }
    user.isHrActiveToday = true;
    user.lastHrActivity = getUsDateStringWithoutTime(new Date());
    await user.save();
    // america new york uses est time
    const usEastTime = new Date().toLocaleString("en-GB", {
        timeZone: "America/New_York",
    });
    // convert into yyyy-mm-dd format
    const dateString = usEastTime.split(",")[0].split("/").reverse().join("-");
    let analytics = await AnalyticsModel.findOne({ analyticsDate: dateString });
    if (!analytics) {
        analytics = await AnalyticsModel.create({
            analyticsDate: dateString,
        });
    }
    analytics.activeHrCount += 1;
    await analytics.save();
}
const { addToQueue: AddAnalyticsQueue } = ConsecutiveTaskQueueInit();
export { ResetTrackingData, IncrementActiveHrCount, AddAnalyticsQueue, IncrementPageViewCount, };
//# sourceMappingURL=analytics.service.js.map