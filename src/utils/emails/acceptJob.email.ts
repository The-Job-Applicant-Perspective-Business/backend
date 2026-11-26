// html template for accepted job email
export const acceptJobSubject = "Update on Job Application Status";
export const acceptJobBody = ({ hrName, jobTitle, }) => {
    return `
        <h4>Dear ${hrName},</h4>
        <p>I hope this message finds you well. We wanted to update you on the status of the job application you recently submitted for approval:</p>
        <p>Job Title: ${jobTitle}<br/>Status: Accepted</p>
        <p>The application has been approved. Please proceed with the next steps in the hiring process. If you have any questions or need further assistance, please feel free to reach out.<br/>Thank you for your attention to this matter.</p>
        <p>Best regards,</p><p></p>Sarah Springsteen Trumble<br/>Administrator<br/>The Job Applicant Perspective</p>
    `;
};
