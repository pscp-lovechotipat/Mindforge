"use server";

import FormData from "form-data";
import aiService from "@/lib/aiService";
import generateAiServiceId from "@/utils/generateAiServiceId";
import getUser from "../auth/getUser";
import prisma from "@/lib/prisma";
import aiStatusToDbStatus from "@/utils/aiStatusToDbStatus";
import aiPriorityToDbPriority from "@/utils/aiPriorityToDbPriority";

export default async function createProject({
    name,
    description,
    files,
    userIds,
}: {
    name: string;
    description: string;
    files: { name: string; buffer: Buffer }[];
    userIds: number[];
}) {
    const user = await getUser();
    if (!user) return;

    const users = await prisma.user.findMany({
        where: {
            id: {
                in: [...userIds, user.id],
            },
            experience: {
                not: null,
            },
            roleId: {
                not: null,
            },
        },
        select: {
            id: true,
            aiServiceId: true,
            experience: true,
            role: {
                select: {
                    name: true,
                },
            },
            skils: {
                select: {
                    name: true,
                },
            },
        },
    });

    if (
        !users.length ||
        users.some((u) => !u.skils.length) ||
        users.length < userIds.length + 1
    ) {
        return {
            success: false,
            message:
                "Users is not enough for create the project (required experience/role/skils)",
        };
    }

    const workspaceId = generateAiServiceId();
    const teamDetails: any = {
        team_members: {},
    };

    for (const user of users) {
        teamDetails.team_members[user.aiServiceId] = {
            current_role: user.role?.name,
            skills: user.skils.map((s) => s.name),
            experience: user.experience,
        };
    }

    const formData = new FormData();
    formData.append("workspace_id", workspaceId);
    formData.append("team_details", JSON.stringify(teamDetails));
    for (const file of files) {
        formData.append("files", Buffer.from(file.buffer), file.name);
    }

    const analyze = await aiService
        .post("/analyze", formData)
        .then((r) => ({ success: true, data: r.data }))
        .catch((e) => ({ success: false, data: e.response?.data }));

    if (!analyze.success) {
        return {
            success: false,
            message: `Analyze Failed${
                analyze.data.message ? `, ${analyze.data.message}` : "."
            }`,
        };
    }

    const tasks = await aiService
        .get(`/workspace/${workspaceId}/tasks`)
        .then((r) => ({ success: true, data: r.data }))
        .catch((e) => ({ success: false, data: e.response?.data }));

    if (!tasks.success) {
        return {
            success: false,
            message: `Get tasks Failed${
                tasks.data.message ? `, ${tasks.data.message}` : "."
            }`,
        };
    }

    // Save to DB
    const project = await prisma.project.create({
        data: {
            aiServiceId: workspaceId,
            name,
            description,
            analyzeResponse: analyze.data,
            users: {
                connect: users.map((u) => ({ id: u.id })),
            },
        },
    });

    const tasksFormatted = [];

    for (const [userAiServiceId, todos] of Object.entries(
        tasks.data as Record<string, any[]>
    )) {
        const user = users.find((u) => u.aiServiceId === userAiServiceId);
        if (!user) continue;
        for (const todo of todos) {
            tasksFormatted.push({
                projectId: project.id,
                userId: user.id,
                name: todo.task,
                role: todo.role,
                status: aiStatusToDbStatus(todo.status),
                priority: aiPriorityToDbPriority(todo.priority),
                raw: todo,
                createdAt: new Date(todo.created_at),
            });
        }
    }

    const todos = await prisma.todo.createMany({
        data: tasksFormatted,
    });

    return {
        success: true,
        data: project,
        message: `Created project!, Analyzed ${todos.count} todos.`,
    };
}
