"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash } from "lucide-react";
import ProjectSettingsForm from "./form";
import toast from "react-hot-toast";
import deleteProject from "@/actions/project/deleteProject";
import { useContext } from "react";
import projectContext from "@/contexts/project";
import { useRouter } from "next/navigation";

export default function ProjectSettingsPage() {
    const project = useContext(projectContext);

    const router = useRouter();

    const handleDeleteClick = () => {
        toast.promise(deleteProject(project.id), {
            loading: "Deleting project...",
            success: "Deleted project!",
            error: "Error!",
        });
        router.push("/");
    };
    return (
        <>
            {/* <h1>ProjectSettingsPage</h1> */}

            <ProjectSettingsForm />
            <AlertDialog>
                <AlertDialogTrigger className="flex gap-2 text-lg font-bold px-6 py-2 bg-red-500 rounded-lg transition hover:bg-red-600 hover:scale-[0.975] active:scale-95">
                    <Trash strokeWidth={2.5} />
                    <p>Delete this project</p>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-myslate-900 border-2">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you sure to delete this project?
                        </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="font-bold bg-myslate-700 border-none hover:text-white hover:bg-myslate-600 hover:scale-[0.975] active:scale-95">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="font-bold bg-red-500 transition hover:bg-red-600 hover:scale-[0.975] active:scale-95"
                            onClick={handleDeleteClick}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
