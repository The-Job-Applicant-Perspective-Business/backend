import { USER_ROLE_ENUM } from "../utils/enums.utils.js";
import { hashPassword } from "../utils/bcrypt.js";
import UserModel from "../models/user.model.js";
import connectDB from "../utils/connectDB.js";
// async function runner() {
//     await connectDBSync();
//     const email = "vimaltony@tghtech.com";
//     const password = "Sample123!";
//     const hash = await hashPassword(password);
//     const role = USER_ROLE_ENUM.ADMIN;
//     await UserModel.create({ email, password: hash, role });
// }
async function runner() {
    await connectDB(process.env.MONGO_URI || "");
    const email = "sample1@sample.com";
    const password = "Sample123!";
    const hash = await hashPassword(password);
    const role = USER_ROLE_ENUM.HR;
    const name = "Vimal Tony";
    const companyName = "TGH Tech";
    const industry = "Tech";
    const noOfEmployees = 100;
    const location = "Chennai";
    const socialLinks = [];
    await UserModel.create({
        email,
        password: hash,
        role,
        name,
        companyName,
        industry,
        noOfEmployees,
        location,
        socialLinks,
    });
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
