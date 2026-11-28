import { USER_ROLE_ENUM } from "../utils/enums.utils.js";
import { hashPassword } from "../utils/bcrypt.js";
import UserModel from "../models/user.model.js";
import connectDB from "../utils/connectDB.js";

async function runner() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error("MONGO_URI environment variable is required.");
    }

    await connectDB(mongoUri);

    const passwordHash = await hashPassword("LocalTest123!");

    await UserModel.findOneAndUpdate(
        { email: "admin-local@saiphhouse.com" },
        {
            $setOnInsert: {
                email: "admin-local@saiphhouse.com",
                password: passwordHash,
                role: USER_ROLE_ENUM.ADMIN,
                name: "Local Admin",
                tokenIds: [],
                socialLinks: [],
                jobCount: 0,
                isHrActiveToday: false,
            },
        },
        { upsert: true, new: true }
    );

    await UserModel.findOneAndUpdate(
        { email: "hr-local@saiphhouse.com" },
        {
            $setOnInsert: {
                email: "hr-local@saiphhouse.com",
                password: passwordHash,
                role: USER_ROLE_ENUM.HR,
                name: "Local HR Recruiter",
                companyName: "Saiph House Local",
                industry: "IT Services & Consulting",
                employmentCount: "21-50",
                location: "Midland, MI",
                tokenIds: [],
                socialLinks: [],
                jobCount: 0,
                isHrActiveToday: false,
            },
        },
        { upsert: true, new: true }
    );
}

runner()
    .then(() => {
        console.log("Local seed script executed successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Local seed script failed with error", error);
        process.exit(1);
    });