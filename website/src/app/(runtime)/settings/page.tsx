export default function SettingsPage() {
    return (
        <div className="grid grid-cols-2 gap-6">
            <div className="border-2 rounded-2xl p-8">
                <h1 className="text-5xl font-bold">Settings</h1>
            </div>
            <div className="flex flex-col gap-6">
                <div className="border-2 rounded-2xl p-8">
                    <h1 className="text-5xl font-bold">Your Role</h1>
                </div>
                <div className="border-2 rounded-2xl p-8">
                    <h1 className="text-5xl font-bold">Your Skill</h1>
                </div>
            </div>
        </div>
    );
}
