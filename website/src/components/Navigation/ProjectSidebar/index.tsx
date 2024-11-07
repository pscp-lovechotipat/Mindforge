import {
    CalendarDays,
    FileUp,
    House,
    ListTodo,
    LogOut,
    Network,
    Settings,
    User,
    Users,
} from "lucide-react";
import Link from "next/link";
import ProjectActiveLink from "./ActiveLink";
import { useContext } from "react";
import projectContext from "@/contexts/project";

export default function ProjectSideBar() {

    return (
        <div className="min-w-[180px] px-4 pt-8 pb-12 flex flex-col items-center justify-between">
            {/* <h1 className="text-4xl mb-8">MF</h1> */}

            <div className="w-full flex flex-col items-center">
                <Link href="/" className="transition hover:scale-95 mb-8">
                    <img
                        className="w-[100px]"
                        src="https://cdn.aona.co.th/1i90n98tq/MF-Logo.svg"
                        alt="MF-Logo"
                    />
                </Link>
                <div className="space-y-6">
                    <ProjectActiveLink href="">
                        <ListTodo size={40} />
                    </ProjectActiveLink>
                    <ProjectActiveLink href="/members">
                        <Users size={40} />
                    </ProjectActiveLink>
                    <ProjectActiveLink href="/tree">
                        <Network size={40} />
                    </ProjectActiveLink>
                    {/* <ProjectActiveLink href="/calendar">
                        <CalendarDays size={40} />
                    </ProjectActiveLink>
                    <ProjectActiveLink href="/upload">
                        <FileUp size={40} />
                    </ProjectActiveLink> */}
                    <ProjectActiveLink href="/settings">
                        <Settings size={40} />
                    </ProjectActiveLink>
                </div>
            </div>
            <Link
                href="/"
                className="w-[65px] aspect-[1/1] flex justify-center items-center rounded-full hover:scale-95 active:scale-90"
            >
                <House size={40} />
            </Link>
        </div>
    );
}
