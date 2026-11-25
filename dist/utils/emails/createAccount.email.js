// html template for account creation email
export const accountCreationSubject = "Account Created";
export const accountCreationBody = ({ name, email, password, }) => {
    return `
        <h1>Account Created</h1>
        <p>Hi, ${name}</p>
        <p>Your account has been created</p>
        <p>email:  ${email}</p>
        <p>password:  ${password}</p>
        <p>Thanks!</p>
    `;
};
//# sourceMappingURL=createAccount.email.js.map