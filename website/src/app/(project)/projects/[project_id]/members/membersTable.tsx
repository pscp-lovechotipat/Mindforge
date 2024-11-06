"use client";

import { GetUsersInProjectResult } from "@/actions/project/getUsersInProject";
import { InviteMembersButton } from "@/components/Dialogs/InviteMembers";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function MembersTable({
    users,
}: {
    users: GetUsersInProjectResult;
}) {
    return (
        <>
            <div className="flex justify-end mb-6">
                <InviteMembersButton className="h-fit px-6" />
            </div>
            <div className="bg-myslate-900 border-2 rounded-2xl overflow-hidden max-w-[calc(100vw-205px)]">
                <Table className="text-lg overflow-x-auto whitespace-nowrap">
                    <TableHeader>
                        <TableRow className="hover:bg-slate-900">
                            <TableHead className="text-white font-bold px-4 py-2">
                                #
                            </TableHead>
                            <TableHead className="text-white font-bold px-4 py-2">
                                Email
                            </TableHead>
                            <TableHead className="text-white font-bold px-4 py-2">
                                Name
                            </TableHead>
                            <TableHead className="text-white font-bold px-4 py-2">
                                Experience
                            </TableHead>
                            <TableHead className="text-white font-bold px-4 py-2">
                                Role
                            </TableHead>
                            <TableHead className="text-white font-bold px-4 py-2">
                                Skills
                            </TableHead>
                            <TableHead className="text-white font-bold px-4 py-2">
                                Created At
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user, idx) => (
                            <TableRow key={idx} className="hover:bg-slate-900">
                                <TableCell className="text-white px-4 py-2">
                                    {user.id}
                                </TableCell>
                                <TableCell className="text-white px-4 py-2">
                                    {user.email}
                                </TableCell>
                                <TableCell className="text-white px-4 py-2">
                                    {user.firstName} {user.lastName}
                                </TableCell>
                                <TableCell className="text-base text-white px-4 py-2 max-w-[400px] truncate">
                                    {user.experience}
                                </TableCell>
                                <TableCell className="text-white px-4 py-2">
                                    {user.role ? (
                                        <p className="w-fit text-sm px-4 py-1 bg-white/10 rounded-full">
                                            {user.role.name}
                                        </p>
                                    ) : (
                                        "-"
                                    )}
                                </TableCell>
                                <TableCell className="text-white px-4 py-2 flex gap-2">
                                    {user.skils.length
                                        ? user.skils.map((skill, idx) => (
                                              <p
                                                  key={idx}
                                                  className="w-fit text-sm px-4 py-1 bg-white/10 rounded-full"
                                              >
                                                  {skill.name}
                                              </p>
                                          ))
                                        : "-"}
                                </TableCell>
                                <TableCell className="text-white/40 px-4 py-2 text-sm">
                                    {user.createdAt.toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
