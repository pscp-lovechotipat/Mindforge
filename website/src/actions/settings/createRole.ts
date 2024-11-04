"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function createRole({
    name,
    description,
}: {
    name: string;
    description: string;
}) {
    await prisma.role.create({
        data: {
            name,
            description,
        },
    });
    revalidatePath("/");
}
