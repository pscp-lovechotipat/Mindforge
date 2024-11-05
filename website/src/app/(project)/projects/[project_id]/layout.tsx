import getMyProject from "@/actions/project/getMyProject";
import ProjectSideBar from "@/components/Navigation/ProjectSidebar";
import ProjectProvider from "@/components/providers/project";
import { Share2, Users } from "lucide-react";
import { notFound } from "next/navigation";

export default async function ProjectLayout({
    params,
    children,
}: {
    params: { project_id: string };
    children: React.ReactNode;
}) {
    let project = null;
    if (!isNaN(+params.project_id)) {
        project = await getMyProject(+params.project_id);
    }
    if (!project) {
        return notFound();
    }
    return (
        <ProjectProvider project={project}>
            <div className="flex min-h-screen">
                <ProjectSideBar />
                <div className="w-full pt-8 pr-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-5xl font-bold">{project.name}</h1>
                        <div className="flex items-center gap-8">
                            {/* <button type="button">
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
                        </button> */}
                            <button
                                type="button"
                                className="flex items-center gap-2"
                            >
                                <p className="font-bold text-xl">Share</p>
                                <Share2 />
                            </button>
                            <button
                                type="button"
                                className="flex items-center gap-4"
                            >
                                <div className="flex -space-x-4">
                                    <img
                                        className="w-[50px] aspect-[1/1] bg-white/10 rounded-full object-cover object-center"
                                        src="/mockup/nicenathapong_profile.jpg"
                                        alt="nicenathapong_profile"
                                    />
                                    <img
                                        className="w-[50px] aspect-[1/1] bg-white/10 rounded-full object-cover object-center"
                                        src="/mockup/nicenathapong_profile.jpg"
                                        alt="nicenathapong_profile"
                                    />
                                    <img
                                        className="w-[50px] aspect-[1/1] bg-white/10 rounded-full object-cover object-center"
                                        src="/mockup/nicenathapong_profile.jpg"
                                        alt="nicenathapong_profile"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold">
                                        PSCP Team
                                    </h1>
                                    <div className="flex gap-2 items-center">
                                        <Users size={14} />
                                        <p className="text-sm">3</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </ProjectProvider>
    );
}
