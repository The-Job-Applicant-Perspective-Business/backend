import ReviewCompanyModel from "../../models/reviewCompany.model.js";
import { REVIEW_SEARCH_TYPE_ENUM, } from "../../utils/enums.utils.js";
const getReviewCompaniesService = async (query) => {
    const { search = "", searchType, status, page, limit } = query;
    let filter = {};
    if (status)
        filter.status = status;
    if (searchType === REVIEW_SEARCH_TYPE_ENUM.COMPANY) {
        filter = {
            ...filter,
            // companyName: { $regex: `^${search}.*`, $options: "i" },
            companyName: { $regex: `${search}.*`, $options: "i" },
        };
    }
    else if (searchType === REVIEW_SEARCH_TYPE_ENUM.JOB_TITLE) {
        filter = {
            ...filter,
            jobTitles: { $regex: `${search}.*`, $options: "i" },
        };
    }
    else if (searchType === REVIEW_SEARCH_TYPE_ENUM.JOB_TITTLE_AND_COMPANY) {
        filter = {
            ...filter,
            $or: [
                { companyName: { $regex: `${search}.*`, $options: "i" } },
                { jobTitles: { $regex: `${search}.*`, $options: "i" } },
            ],
        };
    }
    const data = await ReviewCompanyModel.aggregate([
        {
            $match: {
                ...filter,
            },
        },
        {
            $addFields: {
                totalRatingCount: { $size: "$jobTitles" },
            },
        },
        {
            $addFields: {
                filteredJobTitles: {
                    $filter: {
                        input: "$jobTitles",
                        as: "jobTitle",
                        cond: {
                            $regexMatch: {
                                input: "$$jobTitle",
                                regex: `${search}.*`,
                                options: "i",
                            },
                        },
                    },
                },
            },
        },
        {
            $addFields: {
                totalFilteredRating: { $size: "$filteredJobTitles" },
            },
        },
        {
            $addFields: {
                searchRatingCount: {
                    $cond: {
                        if: { $eq: ["$totalFilteredRating", 0] },
                        then: "$totalRatingCount",
                        else: "$totalFilteredRating",
                    },
                },
            },
        },
        {
            $addFields: {
                jobTitles: "$filteredJobTitles",
                reviewCount: "$searchRatingCount",
            },
        },
        {
            $project: {
                totalRatingCount: 0,
                filteredJobTitles: 0,
                totalFilteredRating: 0,
                searchRatingCount: 0,
            },
        },
        {
            $sort: { avgRating: -1 },
        },
        {
            $facet: {
                data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
                total: [{ $count: "total" }],
            },
        },
    ]);
    return {
        reviewCompanies: data[0].data,
        total: data[0].total[0]?.total || 0,
    };
};
export { getReviewCompaniesService };
//# sourceMappingURL=company.service.js.map