import getUsersInProject from "@/actions/project/getUsersInProject";
import MembersTable from "./membersTable";

export default async function ProjectMembersPage({
    params,
}: {
    params: { project_id: string };
}) {
    const users = await getUsersInProject(+params.project_id);
    return (
        <>
            <MembersTable users={users} />
        </>
    );
}
