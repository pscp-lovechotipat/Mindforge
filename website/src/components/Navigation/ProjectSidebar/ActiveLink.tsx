"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProjectActiveLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const fullPath = `/projects/${1}${href}`;
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
