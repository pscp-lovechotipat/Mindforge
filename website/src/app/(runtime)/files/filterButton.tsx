export default function FilterButton({
    isActive,
    onClick,
    children
}: {
    isActive: boolean;
    onClick: () => any;
    children: React.ReactNode
}) {
    return (
        <button
            type="button"
            className={`px-8 py-2 rounded-2xl ${
                isActive
                    ? "bg-white text-myslate-950"
                    : "text-white hover:bg-white/10"
            } text-lg font-bold transition hover:scale-[0.975] active:scale-95`}
            onClick={e => {
                e.preventDefault();
                onClick();
            }}
        >
            {children}
        </button>
    );
}
