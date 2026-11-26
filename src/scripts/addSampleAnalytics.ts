import AnalyticsModel from "../models/analytics.model.js";
import connectDB from "../utils/connectDB.js";
import { randomInt } from "crypto";
async function runner() {
    await connectDB(process.env.MONGO_URI || "");
    const begin = 1;
    const end = 1000;
    const startDate = new Date("2024-02-02");
    // const endDate = new Date("2023-06-15");
    const endDate = new Date("2024-08-15");
    const dataTrend = [
        {
            jobViewStart: 300,
            jobViewEnd: 400,
            reviewViewStart: 100,
            reviewViewEnd: 150,
            siteViewStart: 400,
            siteViewEnd: 700,
        },
        {
            jobViewStart: 200,
            jobViewEnd: 300,
            reviewViewStart: 150,
            reviewViewEnd: 200,
            siteViewStart: 300,
            siteViewEnd: 500,
        },
        {
            jobViewStart: 600,
            jobViewEnd: 800,
            reviewViewStart: 200,
            reviewViewEnd: 250,
            siteViewStart: 800,
            siteViewEnd: 1000,
        },
        {
            jobViewStart: 500,
            jobViewEnd: 600,
            reviewViewStart: 150,
            reviewViewEnd: 200,
            siteViewStart: 600,
            siteViewEnd: 800,
        },
        {
            jobViewStart: 100,
            jobViewEnd: 200,
            reviewViewStart: 50,
            reviewViewEnd: 100,
            siteViewStart: 200,
            siteViewEnd: 400,
        },
        {
            jobViewStart: 400,
            jobViewEnd: 500,
            reviewViewStart: 100,
            reviewViewEnd: 150,
            siteViewStart: 500,
            siteViewEnd: 700,
        },
        {
            jobViewStart: 200,
            jobViewEnd: 300,
            reviewViewStart: 150,
            reviewViewEnd: 200,
            siteViewStart: 300,
            siteViewEnd: 500,
        },
        {
            jobViewStart: 600,
            jobViewEnd: 800,
            reviewViewStart: 200,
            reviewViewEnd: 250,
            siteViewStart: 800,
            siteViewEnd: 1000,
        },
        {
            jobViewStart: 500,
            jobViewEnd: 600,
            reviewViewStart: 150,
            reviewViewEnd: 200,
            siteViewStart: 600,
            siteViewEnd: 800,
        },
        {
            jobViewStart: 100,
            jobViewEnd: 200,
            reviewViewStart: 50,
            reviewViewEnd: 100,
            siteViewStart: 200,
            siteViewEnd: 400,
        },
        {
            jobViewStart: 400,
            jobViewEnd: 500,
            reviewViewStart: 100,
            reviewViewEnd: 150,
            siteViewStart: 500,
            siteViewEnd: 700,
        },
        {
            jobViewStart: 200,
            jobViewEnd: 300,
            reviewViewStart: 150,
            reviewViewEnd: 200,
            siteViewStart: 300,
            siteViewEnd: 500,
        },
        {
            jobViewStart: 600,
            jobViewEnd: 800,
            reviewViewStart: 200,
            reviewViewEnd: 250,
            siteViewStart: 800,
            siteViewEnd: 1000,
        },
        {
            jobViewStart: 500,
            jobViewEnd: 600,
            reviewViewStart: 150,
            reviewViewEnd: 200,
            siteViewStart: 600,
            siteViewEnd: 800,
        },
    ];
    let curDate = startDate;
    while (curDate.getTime() < endDate.getTime()) {
        console.log(curDate);
        const dataElement = dataTrend[curDate.getMonth()];
        // console.log(curDate.getMonth(), "::", dataElement);
        const analytics = new AnalyticsModel({
            activeHrCount: 20,
            jobPageViews: randomInt(dataElement.jobViewStart, dataElement.jobViewEnd),
            analyticsDate: curDate.toISOString().split("T")[0],
            reviewPageViews: randomInt(dataElement.reviewViewStart, dataElement.reviewViewEnd),
            siteViews: randomInt(dataElement.siteViewStart, dataElement.siteViewEnd),
        });
        // commented out to avoid saving data to db on accident
        // await analytics.save();
        curDate = new Date(curDate);
        curDate.setDate(curDate.getDate() + 1);
    }
}
runner()
    .then(() => {
    console.log("Seed script executed successfully");
    process.exit(0);
})
    .catch((error) => {
    console.error("Seed script failed with error", error);
    process.exit(1);
});
