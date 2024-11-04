"use server";

import FormData from "form-data";
import aiService from "@/lib/aiService";
import generateAiServiceId from "@/utils/generateAiServiceId";

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
    // console.log(name, description, files, userIds);

    // for (const f of files) {
    //     const buffer = Buffer.from(f.buffer);
    // }

    const workspaceId = generateAiServiceId();

    const form = new FormData();

    form.append("workspace_id", "550e8400-e29b-41d4-a716-446655440000".replaceAll("-", ""));
    form.append("team_details", JSON.stringify({
        team_members: {
            "John Doe": {
                current_role: "Software Developer",
                skills: [
                    "Python",
                    "JavaScript",
                    "Docker",
                    "FastAPI",
                    "React",
                    "Node.js",
                    "MongoDB",
                    "PostgreSQL",
                ],
                experience:
                    "5 years in full-stack development with focus on scalable applications",
            },
            "Jane Smith": {
                current_role: "UX Designer",
                skills: [
                    "UI/UX Design",
                    "Figma",
                    "User Research",
                    "Wireframing",
                    "Prototyping",
                    "Adobe XD",
                    "User Testing",
                    "Information Architecture",
                ],
                experience:
                    "3 years in product design for enterprise applications",
            },
            "Mike Johnson": {
                current_role: "Project Manager",
                skills: [
                    "Agile",
                    "Scrum",
                    "Risk Management",
                    "JIRA",
                    "Confluence",
                    "MS Project",
                    "Stakeholder Management",
                    "Budget Planning",
                ],
                experience:
                    "7 years in IT project management with focus on agile methodologies",
            },
        },
    }));
    for (const file of files) {
        form.append("files", Buffer.from(file.buffer), file.name);
    }

    const res = await aiService.post("/analyze", form);

    console.log(res.data);
}
