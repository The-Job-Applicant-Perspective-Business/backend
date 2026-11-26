import axios from "axios";

// temp fix
const featServerSwitch = {
  generalSwitches: {
    email: true,
  },
};

interface SendEmailParams {
  to: string | string[];
  subject: string;
  text: string;
}

const sendEmail = async ({ to, subject, text }: SendEmailParams) => {
  try {
    const source = process.env.SIB_SOURCE?.trim();
    const apiKey = process.env.SIB_KEY?.trim();
    const sender = process.env.SIB_NAME?.trim();

    if (!featServerSwitch.generalSwitches.email) {
      console.log(
        "Email feature is turned off",
        "to:",
        to,
        "subject:",
        subject,
        "text:",
        text
      );
      return;
    }

    if (!apiKey || !source) {
      console.warn(
        "Email skipped: SIB_KEY or SIB_SOURCE is not configured in environment."
      );
      return;
    }

    const recipients =
      typeof to === "string"
        ? [{ email: to, name: "user" }]
        : to.map((email) => ({ email, name: "user" }));

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: sender || "The Job Applicant Perspective",
          email: source,
        },
        to: recipients,
        subject,
        htmlContent: text,
      },
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": apiKey,
        },
      }
    );

    console.log(response.data);
  } catch (err: any) {
    console.log(err?.message, err?.response?.data ?? "No response payload");
  }
};

export default sendEmail;