import { Input } from "@/components/ui/input";
import {
    FolderClosed,
    House,
    LogOut,
    Plus,
    Settings,
    User,
} from "lucide-react";

export default function StartPage() {
    return (
        <div className="flex min-h-screen">
            <div className="min-w-[180px] px-4 pt-8 pb-12 flex flex-col items-center">
                {/* <h1 className="text-4xl mb-8">MF</h1> */}
                <img
                    className="w-[100px] mb-8"
                    src="https://cdn.aona.co.th/1i90n98tq/MF-Logo.svg"
                    alt="MF-Logo"
                />
                <button
                    type="button"
                    className="flex justify-center items-center space-x-1 w-full py-2 mb-6 text-lg font-bold bg-white text-myslate-950 rounded-xl"
                >
                    <Plus strokeWidth={3} size={20} /> <h1>New Project</h1>
                </button>
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
                    <button
                        type="button"
                        className="w-[65px] aspect-[1/1] flex justify-center items-center rounded-full"
                    >
                        <Settings size={40} />
                    </button>
                </div>
                <div className="h-full"></div>
                <button
                    type="button"
                    className="w-[65px] aspect-[1/1] flex justify-center items-center rounded-full"
                >
                    <LogOut size={40} />
                </button>
            </div>
            <div className="w-full pt-6">
                <div className="flex justify-between">
                    <Input className="bg-myslate-800 border-none rounded-full text-xl p-6" />
                </div>
            </div>
        </div>
    );
}
