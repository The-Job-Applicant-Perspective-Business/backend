// html template for job resume email
export const jobResumeSubject = "Job Resumes";
export const jobResumeBody = (jobName, jobType, companyName, resumes) => {
    return `
        <h1>Job Resumes</h1>
        <p>Hi there!</p>
        <p>Here are the resumes for the job:</p>
        <h2>Name: ${jobName}</h2>
        <h3>Type: ${jobType}</h3>
        <h3>Company Name: ${companyName}</h3>
        <p>Resumes are listed below:</p>
        <p>Resumes:${resumes.length}</p>
        <ul>
            ${resumes.map((resume) => `<li><a href="${resume.link}">${resume.name}</a></li>`).join("")}
        </ul>
        <p>Thanks!</p>
    `;
};
//# sourceMappingURL=sendResume.email.js.map