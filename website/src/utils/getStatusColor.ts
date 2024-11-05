export default function getStatusColor(status: number) {
    switch (status) {
        case 0:
            return "border-white/20";
        case 1:
            return "bg-green-500/20 text-green-500 border border-green-500";
        case 2:
            return "bg-white text-black";
    }
}