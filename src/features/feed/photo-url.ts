/**
 * Despite its name, the backend's `Listing.photoUrl` is currently a bare storage key (e.g.
 * `"listings/<id>/photo-0.jpg"`), not an absolute URL: there's no public S3/R2 bucket or CDN yet
 * to resolve it against (see ReNest-Backend's `ListingsService`, and "Known gaps" in CLAUDE.md).
 * Until that base URL exists, treat anything that isn't already a renderable absolute URL as "no
 * photo" so the UI falls back to a placeholder instead of a broken image icon.
 *
 * Duplicated from `features/listings/photo-url.ts` (feature folders don't import each other's
 * internals, see project-structure.md); promote to `src/lib/` in a slice that touches both.
 */
export function isRenderablePhotoUrl(photoUrl: string | null): photoUrl is string {
  if (!photoUrl) return false;

  try {
    const url = new URL(photoUrl);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
