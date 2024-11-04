import { Plus, X } from "lucide-react";
import CreateCustomRole from "./createCustomRole";
import getRoles from "@/actions/settings/getRoles";
import { getMyRole } from "@/actions/settings/getMyRole";
import SetRoleCard from "./setRoleCard";
import MyRoleCard from "./myRoleCard";
import getSkills from "@/actions/settings/getSkills";
import { getMySkills } from "@/actions/settings/getMySkills";
import AddSkillCard from "./addSkillCard";
import MySkillCard from "./mySkillCard";
import CreateCustomSkill from "./createCustomSkill";

export default async function SettingsPage() {
    const [myRole, roles, mySkills] = await Promise.all([
        getMyRole(),
        getRoles(),
        getMySkills(),
    ]);
    const skills = await getSkills({ idNotIn: mySkills.map((s) => s.id) });
    return (
        <div className="grid grid-cols-2 gap-6">
            <div className="border-2 rounded-2xl p-8">
                <h1 className="text-5xl font-bold">Settings</h1>
            </div>
            <div className="flex flex-col gap-6">
                <div className="border-2 rounded-2xl p-8">
                    <h1 className="text-5xl font-bold mb-4">Your Role</h1>
                    {myRole ? (
                        <MyRoleCard role={myRole} />
                    ) : (
                        <>
                            <p className="mb-4">
                                Please select your role before use
                            </p>
                            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto mb-4">
                                {roles.map((role, idx) => (
                                    <SetRoleCard key={idx} role={role} />
                                ))}
                            </div>
                            <CreateCustomRole />
                        </>
                    )}
                </div>
                <div className="border-2 rounded-2xl p-8">
                    <h1 className="text-5xl font-bold mb-4">Your Skill</h1>
                    <p className="mb-4">Your current skills</p>

                    {mySkills.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto mb-4">
                            {mySkills.map((skill, idx) => (
                                <MySkillCard key={idx} skill={skill} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/40 mb-4">
                            You are don{"'"}t have any skills now.
                        </p>
                    )}
                    <div className="h-[1px] w-full bg-white/20 mb-4"></div>
                    <p className="mb-4">Add more skills</p>
                    <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto mb-4">
                        {skills.map((skill, idx) => (
                            <AddSkillCard key={idx} skill={skill} />
                        ))}
                    </div>
                    <CreateCustomSkill />
                </div>
            </div>
        </div>
    );
}
