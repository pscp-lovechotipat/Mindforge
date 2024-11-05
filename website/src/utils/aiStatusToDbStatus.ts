export default function aiStatusToDbStatus(status: string) {
    switch (status) {
        case "pending":
            return 0;
        case "in_progress":
            return 1;
        case "completed":
            return 2;
        default:
            return 0;
    }
}
