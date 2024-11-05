"use client";

import { ReactNode } from "react";
import projectContext from "@/contexts/project";
import { Project } from "@prisma/client";

export default function ProjectProvider({
    project,
    children,
}: {
    project: Project;
    children: ReactNode;
}) {
    return (
        <projectContext.Provider value={project}>
            {children}
        </projectContext.Provider>
    );
}
