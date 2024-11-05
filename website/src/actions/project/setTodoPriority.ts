"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function setTodoPriority(
    todoId: number,
    priority: number
) {
    await prisma.todo.update({
        where: {
            id: todoId,
        },
        data: {
            priority,
        },
    });
    revalidatePath("/");
}
