import { getAuthData } from "../../utils/auth.helper.js";
import { generateAPIError } from "../../lib/errors/apiError.js";
import { JOB_STATUS_ENUM, USER_ROLE_ENUM, } from "../../utils/enums.utils.js";
import { jobFilterQueryGenerator } from "./job.service.js";
import { getLocationData } from "../location/location.service.js";
import UserModel from "../../models/user.model.js";
import JobModel from "../../models/job.model.js";
import sendEmail from "../../utils/email.js";
import { acceptJobBody, acceptJobSubject, } from "../../utils/emails/acceptJob.email.js";
import { rejectJobBody, rejectJobSubject, } from "../../utils/emails/rejectJob.email.js";
import { createHrNotification } from "../notification/notification.service.js";
// import convertToZip from "../../lib/zip/zip.lib.js";
async function createJobController(req, res, session) {
    const { user } = getAuthData(req);
    let hr;
    let companyName;
    let status;
    if (user.role === "hr") {
        hr = user._id.toString();
        companyName = user.companyName || "";
        status = "pending";
    }
    else {
        hr = req.body.hr;
        status = "active";
        const hrDoc = await UserModel.findOne({
            _id: hr,
            role: USER_ROLE_ENUM.HR,
        }, null, { session });
        if (!hrDoc) {
            throw generateAPIError("Invalid HR selected", 400);
        }
        companyName = hrDoc.companyName || "";
    }
    let jobInternalLocation = {
        country: "",
        state: "",
        city: "",
    };
    const { jobTitle, jobType, workPlaceType, jobLocation, jobDescription = "", jobSalaryFrom, jobSalaryTo, } = req.body;
    if (jobLocation) {
        const locationData = await getLocationData(jobLocation);
        if (!locationData) {
            throw generateAPIError("Invalid location", 400);
        }
        jobInternalLocation.country = locationData?.country || "";
        jobInternalLocation.state = locationData?.state || "";
        jobInternalLocation.city = locationData?.city || "";
    }
    const job = (await JobModel.create([
        {
            jobTitle,
            jobTitleExtract: jobTitle.toLowerCase(),
            jobType,
            workPlaceType,
            jobLocation,
            internalJobLocation: jobInternalLocation,
            jobDescription,
            jobDescriptionExtract: jobDescription
                ? Buffer.from(jobDescription, "base64")
                    .toString("utf-8")
                    .replace(/<(?:.|\n)*?>/gm, "")
                    .toLowerCase()
                : "",
            jobSalaryFrom,
            jobSalaryTo,
            hr,
            companyName,
            status,
            lastActiveDate: new Date(),
        },
    ], { session }))[0];
    const hrDoc = await UserModel.findOne({ _id: hr }, null, { session });
    if (!hrDoc) {
        throw generateAPIError("Invalid HR selected", 400);
    }
    hrDoc.jobCount++;
    await hrDoc?.save({ session });
    return res.status(201).json({
        success: true,
        data: job,
        message: "Job created successfully",
    });
}
async function getJobsController(req, res) {
    const user = req.auth?.user;
    const { jobType, jobLocation, datePosted, jobSalary, status, search, workPlaceType, select, page, limit, } = req.query;
    let statusQuery = status;
    if (!user) {
        statusQuery = ["active"];
    }
    let query = await jobFilterQueryGenerator({
        jobLocation,
        datePosted,
        jobSalary,
        jobType,
        search,
        select,
        workPlaceType,
        status: statusQuery,
    });
    if (user && user.role === USER_ROLE_ENUM.HR) {
        query = { ...query, hr: user._id };
    }
    const jobCount = await JobModel.countDocuments(query);
    const jobs = await JobModel.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("hr", "name email company");
    return res.json({
        success: true,
        data: jobs,
        message: "Jobs fetched successfully",
        total: jobCount,
        page,
        limit,
    });
}
async function updateJobController(req, res) {
    const { user } = getAuthData(req);
    const { jobId } = req.params;
    const job = await JobModel.findOne({ _id: jobId });
    if (!job) {
        throw generateAPIError("Job not found", 404);
    }
    if (user.role === USER_ROLE_ENUM.HR &&
        job.hr.toString() !== user._id.toString()) {
        throw generateAPIError("You are not authorized to update this job", 403);
    }
    if (user.role === USER_ROLE_ENUM.HR && job.status === "pending") {
        throw generateAPIError("You are not authorized to update a pending job", 403);
    }
    let jobInternalLocation = {
        country: "",
        state: "",
        city: "",
    };
    const { jobTitle, jobType, workPlaceType, jobLocation, jobDescription = "", jobSalaryFrom, jobSalaryTo, } = req.body;
    if (jobLocation) {
        const locationData = await getLocationData(jobLocation);
        if (!locationData) {
            throw generateAPIError("Invalid location", 400);
        }
        jobInternalLocation.country = locationData?.country || "";
        jobInternalLocation.state = locationData?.state || "";
        jobInternalLocation.city = locationData?.city || "";
    }
    job.jobTitle = jobTitle;
    job.jobTitleExtract = jobTitle.toLowerCase();
    job.jobType = jobType;
    job.workPlaceType = workPlaceType;
    job.jobLocation = jobLocation;
    job.jobDescription = jobDescription;
    job.jobDescriptionExtract = jobDescription
        ? Buffer.from(jobDescription, "base64")
            .toString("utf-8")
            .replace(/<(?:.|\n)*?>/gm, "")
            .toLowerCase()
        : "";
    (job.internalJobLocation = jobInternalLocation),
        (job.jobSalaryFrom = jobSalaryFrom);
    job.jobSalaryTo = jobSalaryTo;
    if (user.role === USER_ROLE_ENUM.HR && job.status === "active") {
        job.status = "pending";
    }
    // job.status = user.role === USER_ROLE_ENUM.HR ? "pending" : job.status;
    await job.save();
    return res.json({
        success: true,
        data: job,
        message: "Job updated successfully",
    });
}
async function applyActionJobController(req, res) {
    const { user } = getAuthData(req);
    const { jobId } = req.params;
    const { action, data } = req.body;
    let { rejectionMessage } = data || { rejectionMessage: "" };
    if (!rejectionMessage) {
        rejectionMessage = "";
    }
    const job = await JobModel.findOne({ _id: jobId });
    if (!job) {
        throw generateAPIError("Job not found", 404);
    }
    if (user.role === USER_ROLE_ENUM.HR &&
        job.hr.toString() !== user._id.toString()) {
        throw generateAPIError("You are not authorized to update this job", 403);
    }
    // send Email function start
    async function sendEmailToApplicant({ type, hrId, jobTitle, rejectionMessage, }) {
        const hr = await UserModel.findOne({ _id: hrId });
        if (!hr) {
            throw generateAPIError("Invalid HR selected", 400);
        }
        if (type === "accept") {
            await createHrNotification({
                userId: hr._id,
                title: "Job Application Accepted",
                message: `Your job application for ${jobTitle} has been accepted`,
            });
            await sendEmail({
                to: hr.email,
                subject: acceptJobSubject,
                text: acceptJobBody({
                    hrName: hr.name || "",
                    jobTitle: jobTitle,
                }),
            });
        }
        else {
            await createHrNotification({
                userId: hr._id,
                title: "Job Application Rejected",
                message: `Your job application for ${jobTitle} has been rejected`,
            });
            await sendEmail({
                to: hr.email,
                subject: rejectJobSubject,
                text: rejectJobBody({
                    hrName: hr.name || "",
                    jobTitle: jobTitle,
                    rejectReason: rejectionMessage,
                }),
            });
        }
    }
    // send Email function end
    switch (action) {
        case "approve":
            if (user.role === USER_ROLE_ENUM.HR) {
                throw generateAPIError("You are not authorized to approve this job", 403);
            }
            if (job.status !== JOB_STATUS_ENUM.PENDING) {
                throw generateAPIError("Only pending jobs can be approved", 403);
            }
            job.status = "active";
            job.lastActiveDate = new Date();
            sendEmailToApplicant({
                type: "accept",
                hrId: job.hr,
                jobTitle: job.jobTitle,
                rejectionMessage: "",
            }).catch((err) => console.log(err));
            break;
        case "reject":
            if (user.role === USER_ROLE_ENUM.HR) {
                throw generateAPIError("You are not authorized to reject this job", 403);
            }
            if (job.status !== JOB_STATUS_ENUM.PENDING) {
                throw generateAPIError("Only pending jobs can be approved", 403);
            }
            job.status = "rejected";
            job.rejectionMessage = rejectionMessage;
            sendEmailToApplicant({
                type: "reject",
                hrId: job.hr,
                jobTitle: job.jobTitle,
                rejectionMessage: rejectionMessage,
            }).catch((err) => console.log(err));
            break;
        case "set-active":
            if (user.role === USER_ROLE_ENUM.HR) {
                throw generateAPIError("You are not authorized to reactivate this job", 403);
            }
            if (job.status !== JOB_STATUS_ENUM.INACTIVE) {
                throw generateAPIError("Only inactive jobs can be set to active", 403);
            }
            job.status = "active";
            job.lastActiveDate = new Date();
            break;
        case "set-inactive":
            if (job.status !== JOB_STATUS_ENUM.ACTIVE) {
                throw generateAPIError("Only active jobs can be set to inactive", 403);
            }
            job.status = "inactive";
            break;
        case "re-apply":
            if (job.status !== JOB_STATUS_ENUM.REJECTED &&
                job.status !== JOB_STATUS_ENUM.INACTIVE) {
                throw generateAPIError("Only inactive or rejected jobs can be re-applied", 403);
            }
            job.status = "pending";
            break;
        default:
            throw generateAPIError("Invalid action", 400);
    }
    await job.save();
    return res.json({
        success: true,
        data: job,
        message: "Job updated successfully",
    });
}
async function deleteJobController(req, res, session) {
    const { user } = getAuthData(req);
    const { jobId } = req.params;
    const job = await JobModel.findOne({ _id: jobId });
    if (!job) {
        throw generateAPIError("Job not found", 404);
    }
    if (user.role === USER_ROLE_ENUM.HR &&
        job.hr.toString() !== user._id.toString()) {
        throw generateAPIError("You are not authorized to delete this job", 403);
    }
    const hrDoc = await UserModel.findOne({ _id: job.hr }, null, { session });
    if (!hrDoc) {
        throw generateAPIError("Invalid HR selected", 400);
    }
    await JobModel.deleteOne({ _id: jobId }, { session });
    hrDoc.jobCount--;
    await hrDoc.save({ session });
    return res.json({
        success: true,
        data: job,
        message: "Job deleted successfully",
    });
}
// async function getAllResumeByJobIdController(req: Request, res: Response) {
//     // const { jobId } = req.params;
//     // const job = await JobModel.findOne({ _id: jobId });
//     // if (!job) {
//     //     throw generateAPIError("Job not found", 404);
//     // }
//     // const jobApplications = await JobApplicationModel.find({
//     //     job: jobId,
//     // });
//     // const resumes = jobApplications.filter((item)=>!item.resume).map((item) => {
//     //     return {
//     //         fileName:item.resume?.fileName || "",
//     //         storageName: item.resume?.storageName || "",
//     //     }
//     // });
//     const jobId = "hello"
//     // const resumes = [{fileName:"Hello",storageName:"resume/667bed1b76d005311fe6a335/29d99ff8-5b33-4274-981b-288e638c241a.asd"}]
//     const resumes = ["10mb.json","25mb.json","26mb.json","27mb.json","28mb.json","29mb.json","30mb.json","31mb.json","32mb.json","33mb.json","34mb.json","35mb.json"].map((item) => {
//         return {
//             fileName:item,
//             storageName: `100mb-fake/${item}`,
//         }
//     });
//     await convertToZip({
//         files: resumes,
//         zippedFileKey: `zip/${jobId}/resumes.zip`,
//     });
//     return res.json({
//         success: true,
//         data: null,
//         message: "Job applications fetched successfully",
//     });
// }
// async function sendAllResumeByJobIdController(req: Request, res: Response) {
//     const { user } = getAuthData(req);
//     const { jobId } = req.params;
//     const job = await JobModel.findOne({ _id: jobId });
//     if (!job) {
//         throw generateAPIError("Job not found", 404);
//     }
//     if (
//         user.role === USER_ROLE_ENUM.HR &&
//         job.hr.toString() !== user._id.toString()
//     ) {
//         throw generateAPIError(
//             "You are not authorized to request resumes of this job",
//             403,
//         );
//     }
//     const jobApplications = await JobApplicationModel.find({
//         job: jobId,
//     });
//     const resumes = jobApplications
//         .filter((item) => item.resume)
//         .map((item) => {
//             return {
//                 name: item.firstName + " " + item.lastName,
//                 link:
//                     (process.env.S3_URL || "") +
//                     (item.resume?.storageName || ""),
//             };
//         });
//     await sendEmail({
//         to: user.email,
//         subject: jobResumeSubject,
//         text: jobResumeBody(
//             job.jobTitle,
//             job.jobType!,
//             job.companyName,
//             resumes,
//         ),
//     });
//     return res.json({
//         success: true,
//         data: null,
//         message: "Job resumes send successfully",
//     });
// }
export { createJobController, getJobsController, deleteJobController, updateJobController, applyActionJobController,
// getAllResumeByJobIdController,
// sendAllResumeByJobIdController,
 };
