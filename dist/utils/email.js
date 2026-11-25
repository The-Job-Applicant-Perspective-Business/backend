import axios from "axios";
// import featServerSwitch from "../config/featServerSwitch.js";
// temp fix
const featServerSwitch = {
    generalSwitches: {
        email: true,
    },
};
const sendEmail = async ({ to, subject, text }) => {
    try {
        const source = process.env.SIB_SOURCE;
        const apiKey = process.env.SIB_KEY;
        const sender = process.env.SIB_NAME;
        if (featServerSwitch.generalSwitches.email) {
            let To;
            if (typeof to === "string")
                To = [{ email: to, name: "user" }];
            else
                To = to.map((email) => ({ email, name: "user" }));
            axios
                .post("https://api.brevo.com/v3/smtp/email", {
                sender: {
                    name: sender || "sample name",
                    email: source,
                },
                to: To,
                subject: subject,
                htmlContent: text,
            }, {
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                    "api-key": apiKey,
                },
            })
                .then((data) => {
                console.log(data.data);
            })
                .catch((err) => {
                console.log(err.message, err.response.data);
            });
        }
        else {
            console.log("Email feature is turned off", "to:", to, "subject:", subject, "text:", text);
        }
    }
    catch (err) {
        console.log(err.message);
    }
};
export default sendEmail;
//# sourceMappingURL=email.js.map