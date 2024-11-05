import getProjectTodos from "@/actions/project/getProjectTodos";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import TodosTable from "./todosTable";

export default async function ProjectPage({
    params,
}: {
    params: { project_id: string };
}) {
    const todos = await getProjectTodos(+params.project_id);
    return (
        <>
            <TodosTable todos={todos} />
        </>
    );
}
