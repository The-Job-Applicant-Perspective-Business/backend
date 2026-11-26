import UserModel from "../../models/user.model.js";
import { generateAPIError } from "../../lib/errors/apiError.js";
import { removeSensitiveUserData } from "../auth/auth.service.js";
import { USER_ROLE_ENUM } from "../../utils/enums.utils.js";
import { getAuthData } from "../../utils/auth.helper.js";
import { hashPassword } from "../../utils/bcrypt.js";
import JobModel from "../../models/job.model.js";
import passwordGenerator from "generate-password-ts";
import sendEmail from "../../utils/email.js";
import { accountCreationBody, accountCreationSubject, } from "../../utils/emails/createAccount.email.js";
import JobApplicationModel from "../../models/jobApplication.model.js";
async function createUserController(req, res) {
    const { email, role, name, companyName, industry, employmentCount, location, socialLinks, } = req.body;
    if (role !== USER_ROLE_ENUM.HR) {
        throw generateAPIError("Only HR can be created", 400);
    }
    const checkUser = await UserModel.findOne({
        email: email.toLowerCase(),
    });
    if (checkUser) {
        throw generateAPIError("User already exists", 400);
    }
    // const password = featServerSwitch.generalSwitches.useDefaultPassword
    //         ? "Sample123!"
    //         : passwordGenerator.generate({
    //               length: 10,
    //               numbers: true,
    //               excludeSimilarCharacters: true,
    //               strict: true,
    //           });
    const password = passwordGenerator.generate({
        length: 10,
        numbers: true,
        excludeSimilarCharacters: true,
        strict: true,
    });
    const user = await UserModel.create({
        email: email.toLowerCase(),
        password: await hashPassword(password),
        role,
        name,
        companyName,
        industry,
        employmentCount,
        location,
        socialLinks,
    });
    sendEmail({
        to: email,
        subject: accountCreationSubject,
        text: accountCreationBody({ name, email, password }),
    });
    const userObj = removeSensitiveUserData(user);
    return res.json({
        success: true,
        data: userObj,
        message: "User created successfully",
    });
}
async function getUsersController(req, res) {
    const { role, search, page, limit } = req.query;
    let query = {};
    if (role)
        query = { ...query, role };
    if (search)
        query = {
            ...query,
            $or: [
                { name: { $regex: search, $options: "i" } },
                { companyName: { $regex: search, $options: "i" } },
            ],
        };
    const userCount = await UserModel.countDocuments(query);
    const users = await UserModel.find({ ...query }, { password: 0, tokenIds: 0, forgotUuid: 0, forgotUuidExpiry: 0 })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });
    return res.json({
        sucess: true,
        data: users,
        message: "Users fetched successfully",
        total: userCount,
        page,
        limit,
    });
}
async function updateUserController(req, res, session) {
    const { user: auth } = getAuthData(req);
    let userId = req.params.userId;
    if (auth.role !== USER_ROLE_ENUM.ADMIN && auth._id.toString() !== userId) {
        throw generateAPIError("Only Admin can update other users", 400);
    }
    const user = await UserModel.findOne({ _id: userId }, {}, { session });
    if (!user) {
        throw generateAPIError("User not found", 404);
    }
    if (user.role !== USER_ROLE_ENUM.HR) {
        throw generateAPIError("Only HR can be updated", 400);
    }
    const { email, name, companyName, industry, employmentCount, location, socialLinks, } = req.body;
    if (user.companyName !== companyName) {
        await JobModel.updateMany({ hr: user._id }, { $set: { companyName } }, { session });
    }
    user.email = email.toLowerCase();
    user.name = name;
    user.companyName = companyName;
    user.industry = industry;
    user.employmentCount = employmentCount;
    user.location = location;
    user.socialLinks = socialLinks;
    await user.save({ session });
    const userObj = removeSensitiveUserData(user);
    return res.json({
        success: true,
        data: userObj,
        message: "User updated successfully",
    });
}
async function deleteUserController(req, res, session) {
    const { user: auth } = getAuthData(req);
    let userId = req.params.userId;
    if (auth.role !== USER_ROLE_ENUM.ADMIN && auth._id.toString() !== userId) {
        throw generateAPIError("Only Admin can delete other users", 400);
    }
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
        throw generateAPIError("User not found", 404);
    }
    if (user.role !== USER_ROLE_ENUM.HR) {
        throw generateAPIError("Only HR can be deleted", 400);
    }
    await UserModel.deleteOne({ _id: userId }, { session });
    await JobModel.deleteMany({ hr: userId }, { session });
    await JobApplicationModel.deleteMany({ hr: userId }, { session });
    const userObj = removeSensitiveUserData(user);
    return res.json({
        success: true,
        data: userObj,
        message: "User deleted successfully",
    });
}
export { getUsersController, createUserController, updateUserController, deleteUserController, };
