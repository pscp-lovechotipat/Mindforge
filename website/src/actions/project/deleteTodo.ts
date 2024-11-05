"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function deleteTodo(todoId: number) {
    await prisma.todo.delete({
        where: {
            id: todoId
        }
    });
    revalidatePath("/");
}