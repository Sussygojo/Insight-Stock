"use client";

import FooterLink from "@/components/forms/FooterLink";
import InputField from "@/components/forms/InputField";
import { Button } from "@/components/ui/button";
import { signInWithEmail } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const SignIn = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });
  const onSubmit = async (data: SignInFormData) => {
    try {
      const result = await signInWithEmail(data);
      if (result.success) router.push("/");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Sign in failed", {
        description:
          error instanceof Error ? error.message : "Failed to sign in",
      });
    }
  };
  return (
    <div>
      <h1 className="form-title">Log In To Your Account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <InputField
          name="email"
          label="Email"
          placeholder="Example: john.doe@example.com"
          register={register}
          error={errors.email}
          validation={{
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+$/i,
              message: "Invalid email address",
            },
          }}
        />
        <InputField
          name="password"
          label="Password"
          placeholder="Must be at least 6 characters"
          register={register}
          type="password"
          validation={{
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          }}
          error={errors.password}
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="yellow-btn w-full mt-5"
        >
          {isSubmitting ? "Signing In" : "Sign In"}
        </Button>
        <FooterLink
          text="Dont have an account?"
          linkText="Sign Up"
          href="/sign-up"
        />
      </form>
    </div>
  );
};

export default SignIn;
