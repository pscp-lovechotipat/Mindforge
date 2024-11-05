"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function toggleAllTodos(
    projectId: number,
    completed: boolean
) {
    await prisma.todo.updateMany({
        where: {
            projectId,
        },
        data: {
            status: completed ? 2 : 0,
        },
    });
    revalidatePath("/");
}
