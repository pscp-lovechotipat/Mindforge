"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function createSkill({
    name,
    description,
}: {
    name: string;
    description: string;
}) {
    await prisma.skill.create({
        data: {
            name,
            description,
        },
    });
    revalidatePath("/");
}
