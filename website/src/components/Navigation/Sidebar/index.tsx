import { FolderClosed, House, User } from "lucide-react";
import LogoutButton from "./LogoutButton";
import CreateProjectDialog from "@/components/Dialogs/CreateProject";
import Link from "next/link";

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
                <CreateProjectDialog />
                <p className="text-xl font-bold mb-6">Menu</p>
                <div className="space-y-6">
                    <button
                        type="button"
                        className="w-[65px] aspect-[1/1] bg-white text-myslate-950 flex justify-center items-center rounded-full"
                    >
                        <House size={40} />
                    </button>
                    <button
                        type="button"
                        className="w-[65px] aspect-[1/1] flex justify-center items-center rounded-full"
                    >
                        <FolderClosed size={40} />
                    </button>
                    <button
                        type="button"
                        className="w-[65px] aspect-[1/1] flex justify-center items-center rounded-full"
                    >
                        <User size={40} />
                    </button>
                </div>
            </div>
            <LogoutButton />
        </div>
    );
}
