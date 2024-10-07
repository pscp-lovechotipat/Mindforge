"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcrypt";
import registerSchema from "@/schemas/registerSchama";

export default async function register({
    firstName,
    lastName,
    email,
    password,
}: z.infer<typeof registerSchema>) {
    const duplicateEmail = await prisma.user.count({
        where: {
            email,
        },
    });
    if (duplicateEmail) {
        return {
            success: false,
            message: "Duplicate email, Please try another email.",
        };
    }
    await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            password: bcrypt.hashSync(password, 12),
        },
    });

    return {
        success: true,
        message: "Register successfully.",
    };
}
