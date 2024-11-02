import {
    CalendarDays,
    FileUp,
    House,
    ListTodo,
    LogOut,
    User,
    Users,
} from "lucide-react";
import Link from "next/link";

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
                    <button
                        type="button"
                        className="w-[65px] aspect-[1/1] bg-white text-myslate-950 flex justify-center items-center rounded-full"
                    >
                        <ListTodo size={40} />
                    </button>
                    <button
                        type="button"
                        className="w-[65px] aspect-[1/1] flex justify-center items-center rounded-full"
                    >
                        <Users size={40} />
                    </button>
                    <button
                        type="button"
                        className="w-[65px] aspect-[1/1] flex justify-center items-center rounded-full"
                    >
                        <CalendarDays size={40} />
                    </button>
                    <button
                        type="button"
                        className="w-[65px] aspect-[1/1] flex justify-center items-center rounded-full"
                    >
                        <FileUp size={40} />
                    </button>
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
