"use client";

import projectContext from "@/contexts/project";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";

export default function ProjectActiveLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    const project = useContext(projectContext);
    const pathname = usePathname();
    const fullPath = `/projects/${project.id}${href}`;
    const isActive = pathname === fullPath;
    return (
        <Link
            href={fullPath}
            className={`w-[65px] aspect-[1/1] ${
                isActive ? "bg-white text-myslate-950" : "bg-white/0 text-white hover:bg-white/10"
            } flex justify-center items-center rounded-full transition hover:scale-[0.975] active:scale-95`}
        >
            {children}
        </Link>
    );
}
