"use server";

import aiService from "@/lib/aiService";
import prisma from "@/lib/prisma";

export default async function getGraph({
    aiServiceId,
}: {
    aiServiceId: string;
}) {
    const graph = await aiService
        .get(`/workspace/${aiServiceId}/graph`)
        .then((r) => ({ success: true, data: r.data }))
        .catch((e) => ({ success: false, data: e.response?.data }));

    if (!graph.success) {
        return {
            nodes: [],
            edges: [],
        };
    }

    const project = await prisma.project.findFirst({
        where: {
            aiServiceId,
        },
        select: {
            name: true,
            users: {
                select: {
                    aiServiceId: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });

    if (!project) {
        return {
            nodes: [],
            edges: [],
        };
    }

    for (const node of graph.data.nodes) {
        if (node.label === aiServiceId) {
            node.label = project.name;
            node.properties.name = project.name;
            continue;
        }
        const userLabel = project.users.find(
            (u) => u.aiServiceId === node.label
        );
        if (userLabel) {
            node.label = `${userLabel.firstName} ${userLabel.lastName}`;
            node.properties.name = `${userLabel.firstName} ${userLabel.lastName}`;
        }
    }

    return graph.data;
}

export type NodeType = "workspace" | "task" | "user" | "document";
export type EdgeType = "HAS_MEMBER" | "ASSIGNED_TO" | "DEPENDS_ON";
export type LayoutType = "hierarchical" | "force";

export interface NodeProperties {
    name?: string;
    team_size?: number;
    created_at?: string;
    type?: string;
    document_count?: number;
    [key: string]: any;
}

export interface ApiNode {
    id: number;
    status: string | null;
    priority: string | null;
    assignee: string | null;
    created_at: string;
    label: string;
    properties: NodeProperties;
    type: string;
}

export interface ApiEdge {
    id: number;
    to: number;
    from: number;
    properties: {
        created_at: string;
        [key: string]: any;
    };
    type: EdgeType;
}

export interface ApiData {
    nodes: ApiNode[];
    edges: ApiEdge[];
}
