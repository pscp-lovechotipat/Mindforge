"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function editProject(id: number, {
    name,
    description,
}: {
    name: string;
    description: string;
}) {
    await prisma.project.update({
        where: {
            id
        },
        data: {
            name,
            description
        }
    });
    revalidatePath("/");
}
