import ReviewCompanyModel from "../../models/reviewCompany.model.js";
import { COMPANY_STATUS_ENUM, REVIEW_STATUS_ENUM, } from "../../utils/enums.utils.js";
import { generateAPIError } from "../../lib/errors/apiError.js";
import ReviewModel from "../../models/review.model.js";
import { getReviewCompaniesService } from "./company.service.js";
async function createReviewCompany(req, res) {
    const user = req.auth?.user;
    const role = user?.role || "user";
    const data = {
        companyName: req.body.companyName,
        industry: req.body.industry,
        employmentCount: req.body.employmentCount,
        location: req.body.location,
        status: role === "admin"
            ? COMPANY_STATUS_ENUM.APPROVED
            : COMPANY_STATUS_ENUM.PENDING,
    };
    const reviewCompany = await ReviewCompanyModel.create(data);
    return res.status(201).json({
        success: true,
        data: reviewCompany,
        message: "Review company created successfully",
    });
}
async function getReviewCompanies(req, res) {
    const user = req.auth?.user;
    const { search, searchType, status, page, limit } = req.query;
    let statusTemp = undefined;
    if (user && user.role === "admin") {
        if (status) {
            statusTemp = status;
        }
    }
    else {
        statusTemp = COMPANY_STATUS_ENUM.APPROVED;
    }
    const { reviewCompanies, total } = await getReviewCompaniesService({
        search,
        searchType,
        status: statusTemp,
        page,
        limit,
    });
    return res.status(200).json({
        success: true,
        data: reviewCompanies,
        message: "Review company fetched successfully",
        total: total,
        page: page,
        limit: limit,
    });
}
async function getReviewCompanyIdController(req, res) {
    const { companyId } = req.params;
    const reviewCompany = await ReviewCompanyModel.findOne({ _id: companyId });
    if (!reviewCompany) {
        throw generateAPIError("Company not found", 404);
    }
    return res.status(200).json({
        success: true,
        data: reviewCompany,
        message: "Company fetched successfully",
    });
}
async function updateCompanyController(req, res) {
    const { companyId } = req.params;
    const company = await ReviewCompanyModel.findOne({ _id: companyId });
    if (!company) {
        throw generateAPIError("Company not found", 404);
    }
    const { companyName, industry, employmentCount, location } = req.body;
    company.companyName = companyName;
    company.industry = industry;
    company.employmentCount = employmentCount;
    company.location = location;
    await company.save();
    return res.status(200).json({
        success: true,
        data: company,
        message: "Company updated successfully",
    });
}
async function applyActionCompanyController(req, res, session) {
    const { companyId } = req.params;
    const { action, data } = req.body;
    const company = await ReviewCompanyModel.findOne({ _id: companyId });
    if (!company) {
        throw generateAPIError("Company not found", 404);
    }
    switch (action) {
        case "transfer":
            const { transferCompanyId } = data;
            const transferCompany = await ReviewCompanyModel.findOne({
                _id: transferCompanyId,
            });
            if (!transferCompany) {
                throw generateAPIError("Transfer company not found", 404);
            }
            // const oldReviews = await ReviewModel.find({ company: companyId, status: REVIEW_STATUS_ENUM.ACTIVE });
            transferCompany.jobTitles = [
                ...transferCompany.jobTitles,
                ...company.jobTitles,
            ];
            company.jobTitles = [];
            if (company.reviewCount > 0 && transferCompany.reviewCount > 0) {
                transferCompany.avgRating =
                    (transferCompany.avgRating * transferCompany.reviewCount +
                        company.avgRating * company.reviewCount) /
                        (transferCompany.reviewCount + company.reviewCount);
                transferCompany.reviewCount += company.reviewCount;
                company.reviewCount = 0;
                company.avgRating = 0;
                console.log("here1");
            }
            else if (company.reviewCount > 0) {
                transferCompany.avgRating = company.avgRating;
                transferCompany.reviewCount = company.reviewCount;
                company.reviewCount = 0;
                company.avgRating = 0;
                console.log("here2");
            }
            await company.save({ session });
            await transferCompany.save({ session });
            await ReviewModel.updateMany({ company: companyId }, { $set: { company: transferCompany._id } }, { session });
            break;
        default:
            throw generateAPIError("Invalid action", 400);
    }
    return res.status(200).json({
        success: true,
        data: company,
        message: "company action applied successfully",
    });
}
async function deleteCompanyController(req, res, session) {
    const { companyId } = req.params;
    const company = await ReviewCompanyModel.findOne({ _id: companyId });
    if (!company) {
        throw generateAPIError("Company not found", 404);
    }
    if (company.reviewCount > 0) {
        throw generateAPIError("Company cannot be deleted as it has reviews", 400);
    }
    await ReviewCompanyModel.deleteOne({ _id: companyId }).session(session);
    await ReviewModel.deleteMany({ company: companyId }).session(session);
    return res.status(200).json({
        success: true,
        data: company,
        message: "Company deleted successfully",
    });
}
async function syncCompanyRatingController(req, res) {
    const { companyId } = req.params;
    let company = [];
    if (companyId !== "all") {
        company = await ReviewCompanyModel.find({ _id: companyId });
    }
    else {
        company = await ReviewCompanyModel.find({});
    }
    if (company.length === 0) {
        return res.status(200).json({
            success: true,
            data: company,
            message: "Company not found",
        });
    }
    for (let i = 0; i < company.length; i++) {
        const reviews = await ReviewModel.find({
            company: company[i]._id,
            status: REVIEW_STATUS_ENUM.ACTIVE,
        });
        let avgRating = 0;
        let reviewCount = 0;
        const jobTitles = [];
        if (reviews.length === 0) {
            company[i].avgRating = 0;
            company[i].reviewCount = 0;
            company[i].jobTitles = [];
            await company[i].save();
            continue;
        }
        reviews.forEach((review) => {
            avgRating += review.rating;
            reviewCount++;
            if (review.jobTitle) {
                jobTitles.push(review.jobTitle);
            }
        });
        company[i].avgRating = avgRating / reviewCount;
        company[i].reviewCount = reviewCount;
        company[i].jobTitles = jobTitles;
        await company[i].save();
    }
    return res.status(200).json({
        success: true,
        data: company,
        message: "Company rating synced successfully",
    });
}
export { createReviewCompany, getReviewCompanies, getReviewCompanyIdController, updateCompanyController, applyActionCompanyController, deleteCompanyController, syncCompanyRatingController, };
