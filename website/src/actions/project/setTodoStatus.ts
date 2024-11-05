"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function setTodoStatus(todoId: number, status: number) {
    await prisma.todo.update({
        where: {
            id: todoId
        },
        data: {
            status
        }
    });
    revalidatePath("/");
}