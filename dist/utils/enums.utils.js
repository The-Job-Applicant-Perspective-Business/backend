const USER_ROLE_ENUM = {
    ADMIN: "admin",
    HR: "hr",
    // USER: "user",
};
const JOB_TYPE_ENUM = {
    FULL_TIME: "full-time",
    PART_TIME: "part-time",
    CONTRACT: "contract",
    INTERNSHIP: "internship",
    SEASONAL: "seasonal",
};
const WORK_PLACE_ENUM = {
    REMOTE: "remote",
    ONSITE: "onsite",
    HYBRID: "hybrid",
};
const DATED_POSTED_ENUM = {
    LAST_24_HOURS: "last-24-hours",
    LAST_3_DAYS: "last-3-days",
    LAST_7_DAYS: "last-7-days",
    LAST_30_DAYS: "last-30-days",
};
const JOB_STATUS_ENUM = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    PENDING: "pending",
    REJECTED: "rejected",
};
const JOB_API_ACTIONS_ENUM = {
    Approve: "approve",
    Reject: "reject",
    SetActive: "set-active",
    SetInactive: "set-inactive",
    ReApply: "re-apply",
};
const JOB_APPLICATION_API_ACTIONS_ENUM = {
    Approve: "approve",
    Reject: "reject",
};
const JOB_APPLICATION_STATUS_ENUM = {
    APPROVED: "approved",
    PENDING: "pending",
};
const SOCIAL_LINKS_ENUM = {
    GENERAL: "general",
    LINKEDIN: "linkedin",
    FACEBOOK: "facebook",
    INSTAGRAM: "instagram",
};
const S3_FILE_TYPES = {
    RESUME: "resume",
    ZIP: "zip",
};
const REVIEW_STATUS_ENUM = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    PENDING: "pending",
    PENDING_NEW_COMPANY: "pending-new-company",
};
const REVIEW_SEARCH_TYPE_ENUM = {
    COMPANY: "company",
    JOB_TITLE: "jobTitle",
    JOB_TITTLE_AND_COMPANY: "jobTitleAndCompany",
};
const COMPANY_STATUS_ENUM = {
    APPROVED: "approved",
    PENDING: "pending",
};
const REVIEW_API_ACTIONS_ENUM = {
    Approve: "approve",
    Reject: "reject",
    SetActive: "set-active",
    SetInactive: "set-inactive",
};
const COMPANY_API_ACTIONS_ENUM = {
    TRANSFER: "transfer",
};
const JOBS_SELECT_OPTIONS_ENUM = {
    JOB: "job",
    JOB_APPLICATION: "jobApplication",
};
const PAGE_TYPE_ENUM = {
    CLASSIFIED: "classified",
    REVIEW: "review",
    JOB: "job",
    OTHER: "other",
};
export { USER_ROLE_ENUM, JOB_TYPE_ENUM, WORK_PLACE_ENUM, DATED_POSTED_ENUM, JOB_STATUS_ENUM, JOB_API_ACTIONS_ENUM, JOB_APPLICATION_STATUS_ENUM, JOB_APPLICATION_API_ACTIONS_ENUM, S3_FILE_TYPES, SOCIAL_LINKS_ENUM, REVIEW_STATUS_ENUM, REVIEW_SEARCH_TYPE_ENUM, COMPANY_STATUS_ENUM, REVIEW_API_ACTIONS_ENUM, JOBS_SELECT_OPTIONS_ENUM, PAGE_TYPE_ENUM, COMPANY_API_ACTIONS_ENUM, };
//# sourceMappingURL=enums.utils.js.map