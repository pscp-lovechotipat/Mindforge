import getMyProjects from "@/actions/project/getMyProjects";
import ProjectCard from "@/components/Cards/ProjectCard";
import {
    CreateProjectButton,
    CreateProjectCard,
} from "@/components/Dialogs/CreateProject";

export default async function HomePage() {
    const projects = await getMyProjects();
    return (
        <>
            {/* <h1>This is home page</h1> */}

            {/* <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-[#020817]/80">
                <div className="w-[600px]">
                    <p>Create a Project</p>
                </div>
            </div> */}
            <div className="flex gap-6 mb-8">
                <div className="min-w-[450px] border-2 rounded-2xl p-6">
                    <h1 className="text-center text-5xl font-bold mb-4">
                        How to use ...
                    </h1>
                    <div className="flex justify-center">
                        <iframe
                            className="h-[160px] aspect-[16/9] border-2 rounded-2xl"
                            src="https://www.youtube.com/embed/0NQPMTJ9rh0?si=bbdEJlitLiNmrE9R"
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
                <div className="w-full border-2 rounded-2xl p-6 gap-8 flex items-center">
                    <h1 className="text-5xl font-bold leading-[60px]">
                        Create
                        <br />
                        New
                        <br />
                        Project
                    </h1>
                    <div className="h-full w-[2px] bg-white"></div>
                    <CreateProjectCard />
                </div>
            </div>
            <div className="border-2 rounded-2xl p-8">
                <div className="flex justify-between mb-6">
                    <h1 className="text-5xl font-bold">Recents</h1>
                    <CreateProjectButton className="px-4" />
                </div>
                <div className="flex flex-wrap gap-4">
                    {projects.map((project, idx) => (
                        <ProjectCard key={idx} project={project} />
                    ))}
                </div>
            </div>
        </>
    );
}
