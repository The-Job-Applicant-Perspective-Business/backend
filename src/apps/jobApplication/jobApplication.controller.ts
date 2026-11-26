import JobApplicationModel from "../../models/jobApplication.model.js";
import { generateAPIError } from "../../lib/errors/apiError.js";
import JobModel from "../../models/job.model.js";
import { getAuthData } from "../../utils/auth.helper.js";
import sendEmail from "../../utils/email.js";
import {
  acceptJobApplicationBody,
  acceptJobApplicationSubject,
} from "../../utils/emails/acceptJobApplication.email.js";
import {
  rejectJobApplicationBody,
  rejectJobApplicationSubject,
} from "../../utils/emails/rejectJobApplication.email.js";

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function createJobApplicationController(req: any, res: any, session: any) {
  const jobId = req.params.jobId;
  if (!jobId) {
    throw generateAPIError("Job id is required", 400);
  }
  const job = await JobModel.findOne({ _id: jobId, status: "active" });
  if (!job) {
    throw generateAPIError("Job not found", 404);
  }
  const { firstName, lastName, email, description, resume } = req.body;
  const jobApplication = (
    await JobApplicationModel.create(
      [
        {
          firstName,
          lastName,
          email,
          description,
          resume: resume || null,
          job: jobId,
          hr: job.hr,
          status: "pending",
        },
      ],
      { session }
    )
  )[0];
  job.applicationNumber += 1;
  await job.save({ session });
  return res.status(201).json({
    success: true,
    data: jobApplication,
    message: "Job application created successfully",
  });
}

async function getJobApplicationsController(req: any, res: any) {
  const { user } = getAuthData(req);
  const { search, jobId, status, page, limit } = req.query;
  if (user.role !== "admin") {
    if (!jobId) {
      throw generateAPIError("Job id is required for role hr", 400);
    }
    const job = await JobModel.findOne({ _id: jobId, hr: user._id });
    if (!job) {
      throw generateAPIError("Job not found", 404);
    }
  }
  const query: Record<string, any> = {};
  if (status) {
    query.status = status;
  }
  if (jobId) {
    query.job = jobId;
  }
  if (search) {
    const safeSearch = escapeRegex(String(search));
    query.$or = [
      { firstName: { $regex: safeSearch, $options: "i" } },
      { lastName: { $regex: safeSearch, $options: "i" } },
      { email: { $regex: safeSearch, $options: "i" } },
      { description: { $regex: safeSearch, $options: "i" } },
    ];
  }
  const count = await JobApplicationModel.countDocuments({ ...query });
  const jobApplications = await JobApplicationModel.find({ ...query })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  return res.status(200).json({
    success: true,
    data: jobApplications,
    message: "Job applications fetched successfully",
    total: count,
    page,
    limit,
  });
}

async function applyActionJobApplicationController(
  req: any,
  res: any,
  session: any
) {
  const { user } = getAuthData(req);
  const { jobApplicationId } = req.params;
  const { action, data } = req.body;
  const jobApplication = await JobApplicationModel.findOne({
    _id: jobApplicationId,
  });
  if (!jobApplication) {
    throw generateAPIError("Job application not found", 404);
  }
  const job = await JobModel.findOne({ _id: jobApplication.job });
  if (!job) {
    throw generateAPIError("Job not found", 404);
  }
  if (
    user.role !== "admin" &&
    jobApplication.hr.toString() !== user._id.toString()
  ) {
    throw generateAPIError(
      "You are not authorized to perform this action",
      403
    );
  }
  switch (action) {
    case "approve":
      jobApplication.status = "approved";
      await jobApplication.save({ session });
      await sendEmail({
        to: jobApplication.email,
        subject: acceptJobApplicationSubject,
        text: acceptJobApplicationBody({
          jobTitle: job.jobTitle,
          companyName: job.companyName,
          userName: jobApplication.firstName,
        }),
      });
      break;
    case "reject":
      if (!data.rejectReason) {
        throw generateAPIError("Reject reason is required", 400);
      }
      await JobModel.updateOne(
        { _id: jobApplication.job },
        { $inc: { applicationNumber: -1 } },
        { session }
      );
      await JobApplicationModel.deleteOne({ _id: jobApplicationId }, { session });
      await sendEmail({
        to: jobApplication.email,
        subject: rejectJobApplicationSubject,
        text: rejectJobApplicationBody({
          jobTitle: job.jobTitle,
          companyName: job.companyName,
          userName: jobApplication.firstName,
          rejectReason: data.rejectReason,
        }),
      });
      break;
    default:
      throw generateAPIError("Invalid action", 400);
  }
  return res.status(200).json({
    success: true,
    data: jobApplication,
    message: "Job application updated successfully",
  });
}

export {
  createJobApplicationController,
  getJobApplicationsController,
  applyActionJobApplicationController,
};