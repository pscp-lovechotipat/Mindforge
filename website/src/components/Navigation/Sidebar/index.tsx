import { FolderClosed, House, Settings, User } from "lucide-react";
import LogoutButton from "./LogoutButton";
import Link from "next/link";
import { CreateProjectButton } from "@/components/Dialogs/CreateProject";
import ActiveLink from "./ActiveLink";

export default function SideBar() {
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
                <CreateProjectButton className="px-3 mb-6" />
                <p className="text-xl font-bold mb-6">Menu</p>
                <div className="space-y-6">
                    <ActiveLink href="/">
                        <House size={40} />
                    </ActiveLink>
                    {/* <ActiveLink href="/files">
                        <FolderClosed size={40} />
                    </ActiveLink> */}
                    <ActiveLink href="/settings">
                        <Settings size={40} />
                    </ActiveLink>
                </div>
            </div>
            <LogoutButton />
        </div>
    );
}
