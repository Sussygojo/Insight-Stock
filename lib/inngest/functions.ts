import { sendWelcomeEmail } from "../nodemailer";
import { inngest } from "./client";
import { PERSONALIZED_WELCOME_EMAIL_PROMPT } from "./prompt";

// type UserCreatedEvent = {
//   name : "app/user.created";
//   data : {
//     country: string;
//     investmentGoals: string;
//     riskTolerance: string;
//     preferredIndustry: string;
//   }
// }
export const sendSignUpEmail = inngest.createFunction(
  { id: "sign-up-email", triggers: { event: "app/user.created" } },
  async ({ event, step }) => {
    const userProfile = `
        - Country: ${event.data.country}
        - Investment goals : ${event.data.investmentGoals}
        - Risk tolerance : ${event.data.riskTolerance}
        - Preffered industry: ${event.data.preferredIndustry}
        `;
    const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(
      "{{user_profile}}",
      userProfile,
    );

    const response = await step.ai.infer("generate-welcome-info", {
      model: step.ai.models.gemini({ model: "gemini-2.0-flash-lite" }),
      body: {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      },
    });
    await step.run("send-welcome-email", async () => {
      const part = response.candidates?.[0]?.content?.parts?.[0];
      const introText =
        (part && "text" in part ? part.text : null) ||
        "Thanks for joining insight, we're excited to have you on board!";

      const {
        data: { email, name },
      } = event;
      return await sendWelcomeEmail({
        email,
        name,
        intro: introText,
      });
    });

    // Do something with response, e.g. send the email via a transport or store it.
    console.log("Inngest welcome email response:", response);
    return {
      success: true,
      message: "Welcome email process completed",
    };
  },
);
