"use server";
import { auth } from "@/lib/better-auth/auth";
import { inngest } from "../inngest/client";
import { headers } from "next/headers";

export const signUpWithEmail = async (data: SignUpFormData) => {
  try {
    const response = await auth.api.signUpEmail({
      body: { email: data.email, password: data.password, name: data.fullName },
    });

    if (response) {
      await inngest.send({
        name: "app/user.created",
        data: {
          email: data.email,
          name: data.fullName,
          country: data.country,
          investmentGoals: data.investmentGoals,
          riskTolerance: data.riskTolerance,
          preferredIndustry: data.preferredIndustry,
        },
      });
    }

    return { success: true, message: "User signed up successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, message: "Error signing up user" };
  }
};
export const signInWithEmail = async ({ email, password }: SignInFormData) => {
  try {
    const response = await auth.api.signInEmail({
      body: { email, password },
    });

    return { success: true, message: "User signed in successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, message: "Error signing in user" };
  }
};

export const signOut = async () => {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch (err) {
    console.log("Sign out failed", err);
  }
};
