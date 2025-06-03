import { z } from "zod";

export  const SignupSchema = z.object({
    name: z
        .string()
        .min(4, "Name must be at least 4 characters long")
        .regex(/^[A-z ]+$/, "Name must only contain alphabets")
        .trim()
        .nonempty("Name is required"),

    username: z
        .string()
        .regex(/^[A-z0-9]+$/, "Username must be alphanumeric")
        .trim()
        .nonempty("Username is required"),

    email: z
        .string()
        .email("Invalid email address")
        .trim()
        .nonempty("Email is required"),

    password: z
        .string()
        .nonempty("Password is required")
        .min(8, "Password must be at least 8 characters long")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/\d/, "Password must contain at least one number")
        .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)")
})

export type TypedSignupSchema = z.infer<typeof SignupSchema>;