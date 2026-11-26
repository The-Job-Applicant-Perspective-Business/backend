// html template for reject job application email
export const rejectJobApplicationSubject = "Job Application Rejected";
export const rejectJobApplicationBody = ({ jobTitle, companyName, userName, rejectReason, }) => {
    return `
        <h1>Job Application Rejected</h1>
        <p>Hi, ${userName}</p>
        <p>Your application for the job ${jobTitle} at ${companyName} has been rejected.</p>
        <p>Reason: ${rejectReason}</p>
        <p>Thanks!</p>
    `;
};
