import type { MutationCtx } from "../_generated/server";

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function ensureUniqueListingSlug(
  ctx: MutationCtx,
  baseSlug: string,
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await ctx.db
      .query("listings")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (!existing) return slug;

    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
}