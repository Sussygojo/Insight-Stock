import { Resend } from "resend";
import {
  WELCOME_EMAIL_TEMPLATE,
  NEWS_SUMMARY_EMAIL_TEMPLATE,
} from "@/lib/nodemailer/templates";

const resend = new Resend(process.env.RESEND_API_KEY!);

export const sendWelcomeEmail = async ({
  email,
  name,
  intro,
}: WelcomeEmailData) => {
  const htmlTemplate = WELCOME_EMAIL_TEMPLATE.replace("{{name}}", name).replace(
    "{{intro}}",
    intro,
  );

  const res = await resend.emails.send({
    from: `"Insight" <onboarding@resend.dev>`,
    to: "nikhilmanjunm@gmail.com",
    subject: `Welcome to Insight - your stock market toolkit is ready!`,
    text: "Thanks for joining Insight",
    html: htmlTemplate,
  });
  if (res.error) {
    console.log("Resend Error: ", res.error);
  }
};

export const sendNewsSummaryEmail = async ({
  email,
  date,
  newsContent,
}: {
  email: string;
  date: string;
  newsContent: string;
}): Promise<void> => {
  const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE.replace(
    "{{date}}",
    date,
  ).replace("{{newsContent}}", newsContent);

  const res = await resend.emails.send({
    from: `"Insight News" <onboarding@resend.dev>`,
    to: "nikhilmanjunm@gmail.com",
    subject: `📈 Market News Summary Today - ${date}`,
    text: `Today's market news summary from Insight`,
    html: htmlTemplate,
  });
  if (res.error) {
    console.log("Resend Error: ", res.error);
  }
};
