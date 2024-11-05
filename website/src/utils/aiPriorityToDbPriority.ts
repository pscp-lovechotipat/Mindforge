export default function aiPriorityToDbPriority(status: string) {
    switch (status) {
        case "low":
            return 0;
        case "medium":
            return 1;
        case "high":
            return 2;
        default:
            return 0;
    }
}
