"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcrypt";
import registerSchema from "@/schemas/registerSchama";
import generateAiServiceId from "@/utils/generateAiServiceId";

export default async function register({
    firstName,
    lastName,
    email,
    password,
    roleId,
    skillsId,
}: z.infer<typeof registerSchema> & { roleId: number; skillsId: number[] }) {
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
    const aiServiceId = generateAiServiceId();
    await prisma.user.create({
        data: {
            aiServiceId,
            firstName,
            lastName,
            email,
            password: bcrypt.hashSync(password, 12),
            roleId,
            skils: {
                connect: skillsId.map((id) => ({ id })),
            },
        },
    });

    return {
        success: true,
        message: "Register successfully.",
    };
}
