import { z } from "zod";

const registerSchema = z
    .object({
        firstName: z.string().min(1).max(255),
        lastName: z.string().min(1).max(255),
        email: z.string().email().max(255),
        password: z
            .string()
            .min(8, "The password must be at least 8 characters long"),
        confirmPassword: z
            .string()
            .min(8, "The password must be at least 8 characters long"),
        experience: z.string().min(1).max(255),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

export default registerSchema;
