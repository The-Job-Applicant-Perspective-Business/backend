// html template for rejected job email
export const rejectJobSubject = "Update on Job Application Status";
export const rejectJobBody = ({ hrName, jobTitle, rejectReason, }) => {
    return `
        <h4>Dear ${hrName},</h4>
        <p>I hope this message finds you well. We wanted to update you on the status of the job application you recently submitted for approval:</p>
        <p>Job Title: ${jobTitle}<br/>Status: Rejected</p>
        <p>Unfortunately, the application has been rejected. Please find the feedback below to assist you in addressing any issues or concerns:<br/>Feedback: ${rejectReason} <br/>If you have any questions or need further assistance, please feel free to reach out.<br/>Thank you for your attention to this matter.</p>
        <p>Best regards,</p><p></p>Sarah Springsteen Trumble<br/>Administrator<br/>The Job Applicant Perspective</p>
    `;
};
//# sourceMappingURL=rejectJob.email.js.map