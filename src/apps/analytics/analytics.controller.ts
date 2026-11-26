import AnalyticsModel from "../../models/analytics.model.js";
import { COMPANY_STATUS_ENUM, JOB_STATUS_ENUM, REVIEW_STATUS_ENUM, USER_ROLE_ENUM, } from "../../utils/enums.utils.js";
import JobModel from "../../models/job.model.js";
import { getUsDateStringWithoutTime } from "../../utils/date.utils.js";
import UserModel from "../../models/user.model.js";
import ReviewCompanyModel from "../../models/reviewCompany.model.js";
import ReviewModel from "../../models/review.model.js";
import { AddAnalyticsQueue, IncrementPageViewCount, } from "./analytics.service.js";
async function AddAnalytics(req, res) {
    const { userId, pageType, jobId } = req.body;
    AddAnalyticsQueue(IncrementPageViewCount, [{ userId, pageType, jobId }]);
    // let userTracking = await UserTrackingModel.findOne({
    //     userId,
    // });
    // if (!userTracking) {
    //     userTracking = await UserTrackingModel.create({
    //         userId,
    //         siteViewed: false,
    //         jobPageViewed: false,
    //         reviewPageViewed: false,
    //         classifiedJobPagesViewed: [],
    //     });
    // }
    // const date = new Date();
    // // america new york uses est time
    // const usEastTime = new Date().toLocaleString("en-GB", {
    //     timeZone: "America/New_York",
    // });
    // // convert into yyyy-mm-dd format
    // const dateString = usEastTime.split(",")[0].split("/").reverse().join("-");
    // let analytics = await AnalyticsModel.findOne({ analyticsDate: dateString });
    // if (!analytics) {
    //     analytics = await AnalyticsModel.create({
    //         analyticsDate: dateString,
    //     });
    // }
    // if (!userTracking.siteViewed) {
    //     analytics.siteViews += 1;
    //     userTracking.siteViewed = true;
    // }
    // switch (pageType) {
    //     case "other":
    //         // site view is already counted above
    //         break;
    //     case "classified":
    //         if (!userTracking.jobPageViewed) {
    //             analytics.jobPageViews += 1;
    //             userTracking.jobPageViewed = true;
    //         }
    //         break;
    //     case "review":
    //         if (!userTracking.reviewPageViewed) {
    //             analytics.reviewPageViews += 1;
    //             userTracking.reviewPageViewed = true;
    //         }
    //         break;
    //     case "job":
    //         if (!userTracking.jobPageViewed) {
    //             analytics.jobPageViews += 1;
    //             userTracking.jobPageViewed = true;
    //         }
    //         if (!userTracking.classifiedJobPagesViewed.includes(jobId)) {
    //             const job = await JobModel.findOne({ _id: jobId });
    //             if (job) {
    //                 job.viewCount += 1;
    //                 userTracking.classifiedJobPagesViewed.push(jobId);
    //                 await job.save();
    //             }
    //         }
    //         break;
    //     default:
    //         throw generateAPIError("Invalid page type", 400);
    // }
    // await analytics.save();
    // await userTracking.save();
    return res.status(200).json({
        success: true,
        data: null,
        message: "Analytics added successfully",
    });
}
async function GetViewsCount(req, res) {
    const d = req.query;
    const dateBegin = getUsDateStringWithoutTime(d.startDate ? d.startDate : new Date());
    const dateEnd = getUsDateStringWithoutTime(d.endDate ? d.endDate : new Date());
    // console.log(dateBegin, dateEnd);
    const analytics = await AnalyticsModel.aggregate([
        {
            $match: {
                analyticsDate: {
                    $gte: dateBegin,
                    $lte: dateEnd,
                },
            },
        },
        {
            $facet: {
                datewiseViews: [
                    {
                        $project: {
                            _id: 0,
                            analyticsDate: 1,
                            siteViews: 1,
                            jobPageViews: 1,
                            reviewPageViews: 1,
                            activeHrCount: 1,
                        },
                    },
                    {
                        $sort: {
                            analyticsDate: 1,
                        },
                    },
                ],
                websiteViews: [
                    {
                        $group: {
                            _id: null,
                            siteViews: {
                                $sum: "$siteViews",
                            },
                            jobPageViews: {
                                $sum: "$jobPageViews",
                            },
                            reviewPageViews: {
                                $sum: "$reviewPageViews",
                            },
                            hrSignupCount: {
                                $sum: "$activeHrCount",
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            siteViews: 1,
                            jobPageViews: 1,
                            reviewPageViews: 1,
                        },
                    },
                ],
            },
        },
    ]);
    const totalHrCount = await UserModel.countDocuments({
        role: USER_ROLE_ENUM.HR,
    });
    const activeHrCount = await UserModel.countDocuments({
        role: USER_ROLE_ENUM.HR,
        lastHrActivity: {
            $gte: dateBegin,
            $lte: dateEnd,
        },
    });
    const datewiseViews = analytics[0].datewiseViews;
    const smallestDate = datewiseViews.length > 0
        ? datewiseViews.reduce((acc, cur) => {
            return acc.analyticsDate < cur.analyticsDate ? acc : cur;
        }).analyticsDate
        : dateEnd;
    let curDate = new Date(dateBegin);
    const fillerData = [];
    while (curDate.toISOString().split("T")[0] < smallestDate) {
        fillerData.push({
            analyticsDate: curDate.toISOString().split("T")[0],
            siteViews: 0,
            jobPageViews: 0,
            reviewPageViews: 0,
            activeHrCount: 0,
        });
        curDate.setDate(curDate.getDate() + 1);
    }
    datewiseViews.unshift(...fillerData);
    // if no data then add empty data
    if (datewiseViews.length === 0) {
        datewiseViews.push({
            analyticsDate: dateEnd,
            siteViews: 0,
            jobPageViews: 0,
            reviewPageViews: 0,
            activeHrCount: 0,
        });
    }
    const analyticsObject = {
        datewiseViews: analytics[0].datewiseViews,
        websiteViews: {
            siteViews: analytics[0].websiteViews[0]?.siteViews || 0,
            jobPageViews: analytics[0].websiteViews[0]?.jobPageViews || 0,
            reviewPageViews: analytics[0].websiteViews[0]?.reviewPageViews || 0,
        },
        totalHrCount: totalHrCount,
        activeHrCount: activeHrCount,
    };
    return res.status(200).json({
        success: true,
        data: analyticsObject,
        message: "Views count fetched successfully",
    });
}
async function GetPostsCount(req, res) {
    const companyCount = await ReviewCompanyModel.countDocuments({
        status: COMPANY_STATUS_ENUM.APPROVED,
    });
    const jobCount = await JobModel.countDocuments({
        status: JOB_STATUS_ENUM.ACTIVE,
    });
    const pendingJobCount = await JobModel.countDocuments({
        status: JOB_STATUS_ENUM.PENDING,
    });
    const reviewCount = await ReviewModel.countDocuments({
        status: REVIEW_STATUS_ENUM.ACTIVE,
    });
    const pendingReviewCount = await ReviewModel.countDocuments({
        status: {
            $in: [
                REVIEW_STATUS_ENUM.PENDING,
                REVIEW_STATUS_ENUM.PENDING_NEW_COMPANY,
            ],
        },
    });
    const data = {
        companyCount,
        jobCount,
        pendingJobCount,
        reviewCount,
        pendingReviewCount,
    };
    return res.status(200).json({
        success: true,
        data,
        message: "Posts count fetched successfully",
    });
}
export { AddAnalytics, GetViewsCount, GetPostsCount };
