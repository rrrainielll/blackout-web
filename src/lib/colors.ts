export const TAG_COLORS = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#8b5cf6', // Purple
    '#f59e0b', // Amber/Orange
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#ef4444', // Red
    '#6366f1', // Indigo
    '#14b8a6', // Teal
    '#f43f5e', // Rose
];

export function getTagColor(tagName: string): string {
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
        hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % TAG_COLORS.length;
    return TAG_COLORS[index];
}
