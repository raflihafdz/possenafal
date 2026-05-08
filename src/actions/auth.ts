"use server";

import { signIn, signOut } from "@/lib/auth";
import { loginSchema } from "@/schemas";
import { AuthError } from "next-auth";

export async function loginAction(formData: { email: string; password: string }) {
  const validated = loginSchema.safeParse(formData);

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Validation failed" };
  }

  try {
    await signIn("credentials", {
      email: validated.data.email,
      password: validated.data.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "Something went wrong" };
      }
    }
    // Check if the error message contains useful info
    if (error instanceof Error) {
      if (error.message.includes("deactivated")) {
        return { error: "Your account has been deactivated" };
      }
    }
    return { error: "Invalid email or password" };
  }
}

export async function logoutAction() {
  await signOut({ redirect: false });
}
