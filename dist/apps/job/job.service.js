import { generateAPIError } from "../../lib/errors/apiError.js";
import JobModel from "../../models/job.model.js";
import { getLocationData } from "../location/location.service.js";
async function jobFilterQueryGenerator({ search, jobType, jobLocation, datePosted, jobSalary, workPlaceType, select, status, }) {
    let query = {};
    if (search) {
        query = {
            ...query,
            $or: [
                { jobTitle: { $regex: search, $options: "i" } },
                { companyName: { $regex: search, $options: "i" } },
                { jobDescriptionExtract: { $regex: search, $options: "i" } },
            ],
        };
        // query = { ...query, $or: [{$text: { $search: search } }, { jobTitle: { $regex: search, $options: "i" } }, {companyName:{$regex: search, $options: "i" }}] };
    }
    if (jobType && jobType.length > 0) {
        query = { ...query, jobType: { $in: jobType } };
    }
    if (workPlaceType) {
        query = { ...query, workPlaceType };
    }
    if (jobLocation) {
        const location = await getLocationData(jobLocation);
        if (!location) {
            throw generateAPIError("Invalid location", 400);
        }
        const locationFilter = {};
        if (location.city) {
            locationFilter["internalJobLocation.city"] = location.city;
        }
        if (location.state) {
            locationFilter["internalJobLocation.state"] = location.state;
        }
        if (location.country) {
            locationFilter["internalJobLocation.country"] = location.country;
        }
        query = { ...query, ...locationFilter };
    }
    if (datePosted) {
        switch (datePosted) {
            case "last-24-hours":
                query = {
                    ...query,
                    createdAt: {
                        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                };
                break;
            case "last-3-days":
                query = {
                    ...query,
                    createdAt: {
                        $gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                    },
                };
                break;
            case "last-7-days":
                query = {
                    ...query,
                    createdAt: {
                        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                };
                break;
            case "last-30-days":
                query = {
                    ...query,
                    createdAt: {
                        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                };
                break;
            default:
                break;
        }
    }
    if (jobSalary) {
        query = { ...query, jobSalaryTo: { $gte: jobSalary } };
    }
    if (select && select === "jobApplication") {
        if (query["$or"]) {
            query = {
                $and: [
                    {
                        $or: query["$or"],
                    },
                    {
                        $or: [
                            { applicationNumber: { $gt: 0 } },
                            { status: { $in: ["active", "inactive"] } },
                        ],
                    },
                ],
            };
            delete query["$or"];
        }
        else {
            query = {
                ...query,
                $or: [
                    { applicationNumber: { $gt: 0 } },
                    { status: { $in: ["active", "inactive"] } },
                ],
            };
        }
    }
    else {
        if (status && status.length > 0) {
            query = { ...query, status: { $in: status } };
        }
    }
    return query;
}
async function inactiveJobsCronJobService(noOfDays) {
    const query = {
        status: "active",
        lastActiveDate: {
            $lte: new Date(Date.now() - noOfDays * 24 * 60 * 60 * 1000),
        },
    };
    const update = {
        status: "inactive",
    };
    const result = await JobModel.updateMany(query, { $set: update });
}
export { jobFilterQueryGenerator, inactiveJobsCronJobService };
//# sourceMappingURL=job.service.js.map