import { COMPANY_STATUS_ENUM, 
// JobTypeEnumType,
REVIEW_STATUS_ENUM, } from "../../utils/enums.utils.js";
import ReviewModel from "../../models/review.model.js";
import { generateAPIError } from "../../lib/errors/apiError.js";
import ReviewCompanyModel from "../../models/reviewCompany.model.js";
import { reviewFilterQueryGenerator } from "./review.service.js";
async function createReviewController(req, res, session) {
    const { company, jobTitle, 
    // jobType,
    applicationDate, noOfDays, noOfInterviews, hiringPlatform, otherHiringPlatform, title, description, rating, } = req.body;
    const companyObj = await ReviewCompanyModel.findOne({
        _id: company,
    }).session(session);
    if (!companyObj) {
        throw generateAPIError("Company not found", 404);
    }
    const status = companyObj.status === COMPANY_STATUS_ENUM.APPROVED
        ? REVIEW_STATUS_ENUM.PENDING
        : REVIEW_STATUS_ENUM.PENDING_NEW_COMPANY;
    const review = (await ReviewModel.create([
        {
            company,
            // jobType,
            jobTitle,
            applicationDate,
            noOfDays,
            noOfInterviews,
            hiringPlatform,
            otherHiringPlatform,
            title,
            description: description || "",
            rating,
            status,
        },
    ], { session }))[0];
    // companyObj.reviewCount += 1;
    // companyObj.avgRating =
    //     (companyObj.avgRating * (companyObj.reviewCount - 1) + rating) /
    //     companyObj.reviewCount;
    // await companyObj.save({ session });
    return res.status(201).json({
        success: true,
        data: review,
        message: "Review created successfully",
    });
}
async function getReviewsController(req, res) {
    const user = req.auth?.user;
    const { companyId, search, jobTitle, rating, 
    // jobType,
    datePosted, status, page, limit, } = req.query;
    const query = reviewFilterQueryGenerator({
        companyId,
        search,
        jobTitle,
        rating: rating ? parseInt(rating) : undefined,
        // jobType,
        datePosted,
        status,
    });
    let reviews;
    let reviewCount = 0;
    // const review = await ReviewModel.find(query).populate("company");
    if (user?.role === "admin") {
        reviewCount = await ReviewModel.countDocuments(query);
        reviews = await ReviewModel.find(query)
            .populate("company")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });
    }
    else {
        reviewCount = await ReviewModel.countDocuments({
            ...query,
            status: REVIEW_STATUS_ENUM.ACTIVE,
        });
        reviews = await ReviewModel.find({
            ...query,
            status: REVIEW_STATUS_ENUM.ACTIVE,
        })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });
    }
    return res.status(200).json({
        success: true,
        data: reviews,
        message: "Reviews fetched successfully",
        totalCount: reviewCount,
        page,
        limit,
    });
}
async function updateReviewController(req, res, session) {
    const { reviewId } = req.params;
    const { company, companyName, industry, employmentCount, location, jobTitle, 
    // jobType,
    applicationDate, noOfDays, noOfInterviews, hiringPlatform, otherHiringPlatform, title, description, rating, } = req.body;
    const review = await ReviewModel.findOne({ _id: reviewId });
    if (!review) {
        throw generateAPIError("Review not found", 404);
    }
    const oldCompany = await ReviewCompanyModel.findOne({
        _id: review.company,
    });
    if (!oldCompany) {
        throw generateAPIError("Company not found", 404);
    }
    if (review.status === REVIEW_STATUS_ENUM.PENDING_NEW_COMPANY) {
        const companyObj = await ReviewCompanyModel.findOne({
            _id: company,
        }).session(session);
        if (!companyObj) {
            throw generateAPIError("Company not found", 404);
        }
        if (review.company.toString() === company) {
            companyObj.companyName = companyName;
            companyObj.industry = industry;
            companyObj.employmentCount = employmentCount;
            companyObj.location = location;
        }
        else {
            review.status = REVIEW_STATUS_ENUM.PENDING;
            review.company = company;
        }
        await companyObj.save({ session });
    }
    else if (review.status === REVIEW_STATUS_ENUM.ACTIVE) {
        if (review.company.toString() !== company) {
            const companyObj = await ReviewCompanyModel.findOne({
                _id: company,
            }).session(session);
            if (!companyObj) {
                throw generateAPIError("Company not found", 404);
            }
            const jobIndex = oldCompany.jobTitles.findIndex((jobTitleStr) => jobTitleStr === review.jobTitle);
            if (jobIndex !== -1) {
                oldCompany.jobTitles.splice(jobIndex, 1);
            }
            companyObj.jobTitles.push(jobTitle);
            companyObj.reviewCount += 1;
            oldCompany.reviewCount -= 1;
            companyObj.avgRating =
                (companyObj.avgRating * (companyObj.reviewCount - 1) + rating) /
                    companyObj.reviewCount;
            oldCompany.avgRating =
                oldCompany.reviewCount === 0
                    ? 0
                    : (oldCompany.avgRating * (oldCompany.reviewCount + 1) -
                        review.rating) /
                        oldCompany.reviewCount;
            await oldCompany.save({ session });
            await companyObj.save({ session });
            review.company = company;
        }
        else {
            if (review.rating !== rating) {
                oldCompany.avgRating =
                    (oldCompany.avgRating * oldCompany.reviewCount -
                        review.rating +
                        rating) /
                        oldCompany.reviewCount;
                await oldCompany.save({ session });
            }
            if (review.jobTitle !== jobTitle) {
                const jobIndex = oldCompany.jobTitles.findIndex((jobTitleStr) => jobTitleStr === review.jobTitle);
                if (jobIndex !== -1) {
                    oldCompany.jobTitles.splice(jobIndex, 1);
                }
                oldCompany.jobTitles.push(jobTitle);
                await oldCompany.save({ session });
            }
        }
    }
    else {
        if (review.company.toString() !== company) {
            const companyObj = await ReviewCompanyModel.findOne({
                _id: company,
            }).session(session);
            if (!companyObj) {
                throw generateAPIError("Company not found", 404);
            }
            review.company = company;
        }
    }
    // review.company = company;
    // review.jobType = jobType;
    review.jobTitle = jobTitle;
    review.applicationDate = applicationDate;
    review.noOfDays = noOfDays;
    review.noOfInterviews = noOfInterviews;
    review.hiringPlatform = hiringPlatform;
    review.otherHiringPlatform = otherHiringPlatform;
    review.title = title;
    review.description = description || "";
    review.rating = rating;
    await review.save({ session });
    return res.status(200).json({
        success: true,
        data: review,
        message: "Review updated successfully",
    });
}
async function applyActionReviewController(req, res, session) {
    const { reviewId } = req.params;
    const { action, data } = req.body;
    const review = await ReviewModel.findOne({ _id: reviewId });
    if (!review) {
        throw generateAPIError("Review not found", 404);
    }
    const company = await ReviewCompanyModel.findOne({ _id: review.company });
    if (!company) {
        throw generateAPIError("Company not found", 404);
    }
    switch (action) {
        case "set-active":
            if (review.status !== REVIEW_STATUS_ENUM.INACTIVE) {
                throw generateAPIError("Review is not inactive", 400);
            }
            review.status = REVIEW_STATUS_ENUM.ACTIVE;
            company.reviewCount += 1;
            company.avgRating =
                (company.avgRating * (company.reviewCount - 1) +
                    review.rating) /
                    company.reviewCount;
            company.jobTitles.push(review.jobTitle);
            await review.save({ session });
            await company.save({ session });
            break;
        case "set-inactive":
            if (review.status !== REVIEW_STATUS_ENUM.ACTIVE) {
                throw generateAPIError("Review is not active", 400);
            }
            review.status = REVIEW_STATUS_ENUM.INACTIVE;
            company.reviewCount -= 1;
            company.avgRating =
                (company.avgRating * (company.reviewCount + 1) -
                    review.rating) /
                    company.reviewCount;
            if (company.reviewCount === 0) {
                company.avgRating = 0;
            }
            const jobIndex = company.jobTitles.findIndex((jobTitle) => jobTitle === review.jobTitle);
            if (jobIndex !== -1) {
                company.jobTitles.splice(jobIndex, 1);
            }
            // company.jobTitles.splice(jobIndex, 1);
            await review.save({ session });
            await company.save({ session });
            break;
        case "approve":
            if (company.status !== COMPANY_STATUS_ENUM.APPROVED) {
                //         industry: req.body.industry,
                // employmentCount: req.body.employmentCount,
                // location: req.body.location,
                if (!company.industry ||
                    !company.employmentCount ||
                    !company.location) {
                    throw generateAPIError("Company details are missing, Update company details before approving the review", 400);
                }
                company.status = COMPANY_STATUS_ENUM.APPROVED;
            }
            if (review.status !== REVIEW_STATUS_ENUM.PENDING &&
                review.status !== REVIEW_STATUS_ENUM.PENDING_NEW_COMPANY) {
                throw generateAPIError("Review is not pending", 400);
            }
            review.status = REVIEW_STATUS_ENUM.ACTIVE;
            company.reviewCount += 1;
            company.avgRating =
                (company.avgRating * (company.reviewCount - 1) +
                    review.rating) /
                    company.reviewCount;
            company.jobTitles.push(review.jobTitle);
            await review.save({ session });
            await company.save({ session });
            break;
        case "reject":
            await ReviewModel.deleteOne({ _id: reviewId }).session(session);
            break;
        default:
            throw generateAPIError("Invalid action", 400);
    }
    return res.status(200).json({
        success: true,
        data: review,
        message: "Review updated successfully",
    });
}
async function deleteReviewController(req, res, session) {
    const { reviewId } = req.params;
    const review = await ReviewModel.findOne({ _id: reviewId });
    if (!review) {
        throw generateAPIError("Review not found", 404);
    }
    if (review.status === REVIEW_STATUS_ENUM.ACTIVE) {
        const company = await ReviewCompanyModel.findOne({
            _id: review.company,
        });
        if (!company) {
            throw generateAPIError("Company not found", 404);
        }
        company.reviewCount -= 1;
        company.avgRating =
            (company.avgRating * (company.reviewCount + 1) - review.rating) /
                company.reviewCount;
        if (company.reviewCount === 0) {
            company.avgRating = 0;
        }
        const jobIndex = company.jobTitles.findIndex((jobTitle) => jobTitle === review.jobTitle);
        if (jobIndex !== -1) {
            company.jobTitles.splice(jobIndex, 1);
        }
        // company.jobTitles.splice(jobIndex, 1);
        await company.save({ session });
    }
    await ReviewModel.deleteOne({ _id: reviewId }).session(session);
    return res.status(200).json({
        success: true,
        data: review,
        message: "Review deleted successfully",
    });
}
export { createReviewController, getReviewsController, updateReviewController, applyActionReviewController, deleteReviewController, };
