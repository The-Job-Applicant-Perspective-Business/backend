import cron from "node-cron";
import connectDB from "../utils/connectDB.js";
import { inactiveJobsCronJobService } from "../apps/job/job.service.js";
import { createDailyAdminNotification, createWeeklyAdminNotification, } from "../apps/notification/notification.service.js";
import { ResetTrackingData } from "../apps/analytics/analytics.service.js";
const registerCronJobs = () => {
    // cron job to inactive the job after 30 days of posting
    console.log("registering cron jobs");
    cron.schedule("0 2 * * *", async () => {
        try {
            console.log("running a task every day at 2:00 AM for inactivating jobs older than 30 days::", new Date());
            await inactiveJobsCronJobService(30);
            console.log("cron job for inactivating jobs older than 30 days completed");
        }
        catch (err) {
            console.log("error in cron job", err);
        }
    }, {
        scheduled: true,
        timezone: "America/New_York",
    });
    console.log("cron job for inactivating jobs older than 30 days registered");
    // cron job clear tracking data every day at 12:00 am
    cron.schedule("0 0 * * *", async () => {
        try {
            console.log("running a task every day at 12:00 AM for clearing tracking data::", new Date());
            await ResetTrackingData();
            console.log("cron job for clearing tracking data completed");
        }
        catch (err) {
            console.log("error in cron job", err);
        }
    }, {
        scheduled: true,
        timezone: "America/New_York",
    });
    console.log("cron job for clearing tracking data registered");
    // cron job to notify admin of daily report at 5:00 pm est which is 21:00 utc
    // const dailyAdminNotificationTime = new Date("2021-09-01T21:00:00.000Z");
    // const { hour: dailyhour, min: dailyminute } = getHoursAndMinutes(
    //     dailyAdminNotificationTime,
    // );
    cron.schedule(`0 17 * * *`, async () => {
        try {
            console.log("running a task every day at 5:00pm est for creating daily admin notification::", new Date());
            await createDailyAdminNotification();
            console.log("cron job for creating daily admin notification completed");
        }
        catch (err) {
            console.log("error in cron job", err);
        }
    }, {
        scheduled: true,
        timezone: "America/New_York",
    });
    console.log("cron job for creating daily admin notification registered");
    // cron job to notify admin of weekly report at 5:00 pm est which is 21:00 utc every saturday
    cron.schedule(`0 17 * * 6`, async () => {
        try {
            console.log("running task every saturday at 5:00pm est for creating weekly admin notification::", new Date());
            await createWeeklyAdminNotification();
            console.log("cron job for creating weekly admin notification completed");
        }
        catch (err) {
            console.log("error in cron job", err);
        }
    }, {
        scheduled: true,
        timezone: "America/New_York",
    });
    console.log("cron job for creating weekly admin notification registered");
};
const init = async () => {
    console.log("running: cron.ts entrypoint");
    await connectDB(process.env.MONGO_URI || "");
    registerCronJobs();
};
init();
