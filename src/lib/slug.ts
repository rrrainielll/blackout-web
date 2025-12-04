import { prisma } from '@/lib/prisma'

/**
 * Generate a URL-friendly slug from a title
 * @param title The post title
 * @returns A URL-safe slug
 */
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
        .substring(0, 100) // Limit length
}

/**
 * Generates a unique slug for a post title by checking for collisions in the database.
 * If a slug already exists, it appends a counter to create a unique version.
 * @param title The title of the post to generate a slug for.
 * @returns A promise that resolves to a unique URL-friendly slug.
 */
export async function makeUniqueSlug(title: string): Promise<string> {
    const baseSlug = generateSlug(title)
    let uniqueSlug = baseSlug
    let counter = 1

    // Check for collisions and append counter until a unique slug is found
    while (await prisma.post.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${baseSlug}-${counter}`
        counter++
    }

    return uniqueSlug
}
