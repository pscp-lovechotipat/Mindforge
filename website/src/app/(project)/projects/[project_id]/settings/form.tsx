import editProject from "@/actions/project/editProject";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import projectContext from "@/contexts/project";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Save } from "lucide-react";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const formSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().min(1).max(10000),
});

export default function ProjectSettingsForm() {
    const project = useContext(projectContext);

    const [isLoading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: project.name,
            description: project.description,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (isLoading) return;
        setLoading(true);
        await editProject(project.id, {
            name: values.name,
            description: values.description,
        });
        setLoading(false);
        toast.success("Saved project info!");
    }

    return (
        <div className="w-[600px] p-6 border-2 rounded-2xl mb-6">
            <p className="text-white/40 mb-6">Edit project info</p>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="overflow-y-auto max-h-[600px]">
                        <div className="space-y-4 mb-8">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xl font-bold">
                                            Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                className="border-none text-lg px-4 py-6 rounded-xl bg-myslate-800"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xl font-bold">
                                            Description
                                        </FormLabel>
                                        <div className="bg-myslate-800 rounded-xl">
                                            <FormControl>
                                                <Textarea
                                                    className="w-full h-[150px] border-none rounded-xl text-lg"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <div className="px-4 flex justify-center">
                                                <div className="w-full border-t border-white/40 flex justify-end px-4 py-1">
                                                    <p
                                                        className={`font-semibold ${
                                                            field.value
                                                                ?.length > 10000
                                                                ? "text-red-500"
                                                                : ""
                                                        }`}
                                                    >
                                                        {field.value?.length ??
                                                            0}{" "}
                                                        / 10000 word
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="flex gap-2 justify-center items-center bg-white text-myslate-900 px-4 py-2 w-full rounded-xl font-bold transition hover:scale-[0.975] active:scale-95"
                    >
                        {isLoading ? (
                            <LoaderCircle
                                className="animate-spin"
                                strokeWidth={2.5}
                            />
                        ) : (
                            <Save strokeWidth={2.5} />
                        )}
                        <p className="text-lg font-bold">Save project info</p>
                    </button>
                </form>
            </Form>
        </div>
    );
}
