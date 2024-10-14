import SideBar from "@/components/Navigation/Sidebar";
import { Input } from "@/components/ui/input";
import { Bell, CalendarDays, ChevronDown, Search } from "lucide-react";

export default function RuntimeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <SideBar />
            <div className="w-full pt-6 pr-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative flex w-[600px] h-[50px] bg-myslate-800 rounded-full">
                        <div className="w-[60px]">
                            <Search className="absolute top-1/2 -translate-y-1/2 left-4" />
                        </div>
                        <Input
                            className="text-xl pl-0 pr-6 py-6 border-none"
                            placeholder="Search your content"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button type="button">
                            <Bell />
                        </button>
                        <button type="button">
                            <CalendarDays />
                        </button>
                        <div className="w-[2px] h-[30px] bg-white rounded-full"></div>
                        <button
                            type="button"
                            className="flex items-center gap-3 p-1 hover:bg-myslate-800 rounded-full"
                        >
                            <img
                                className="w-[50px] aspect-[1/1] bg-white/10 rounded-full"
                                src="/mockup/nicenathapong_profile.jpg"
                                alt="mockup"
                            />
                            <h1 className="font-bold text-lg">Cscosmo</h1>
                            <ChevronDown />
                        </button>
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
}
