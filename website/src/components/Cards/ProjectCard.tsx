import { Project } from "@prisma/client";
import Link from "next/link";

export default function ProjectCard({ project }: { project: Project }) {
    return (
        <Link
            href={`/projects/${project.id}`}
            className="w-[300px] text-left transition hover:scale-[0.975] active:scale-95"
        >
            <div className="w-full aspect-[16/9] bg-white/10 border-2 border-myslate-500 rounded-2xl mb-2 flex justify-center items-center"></div>
            <h1 className="text-lg font-bold">{project.name}</h1>
            <p className="text-sm">Date : {project.createdAt.toLocaleString()}</p>
        </Link>
    );
}
