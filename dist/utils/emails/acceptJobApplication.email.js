// html template for accept job application email
export const acceptJobApplicationSubject = "Job Application Accepted";
export const acceptJobApplicationBody = ({ jobTitle, companyName, userName, }) => {
    return `
        <h1>Job Application Accepted</h1>
        <p>Hi, ${userName}</p>
        <p>Your application for the job ${jobTitle} at ${companyName} has been moved to active consideration in stage 2 of hiring.</p>
        <p>Thanks!</p>
    `;
};
//# sourceMappingURL=acceptJobApplication.email.js.map