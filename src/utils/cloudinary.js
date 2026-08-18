/**
 * Returns the original image URL unchanged.
 *
 * We intentionally DO NOT apply Cloudinary on-the-fly transformations to the
 * generic image helper anymore. Every unique transformation URL (e.g.
 * `w_600,c_limit,q_auto,f_auto`) makes Cloudinary generate a new derivative on
 * first request, which added 1-3s of latency per image and caused slow, chunked
 * ("kat kat") rendering on mobile.
 *
 * Images are already optimized at upload time (backend caps them at
 * 1600x1600 with `quality: auto`), so the stored URL is served straight from
 * Cloudinary's CDN cache — the fastest possible delivery.
 *
 * Kept as a function so all call sites work unchanged.
 */
export const optimizeImage = (url) => url;

/**
 * Optimized URL for the site LOGO only.
 *
 * The logo is the one image that must never be blurry, but it also can't be
 * served at full original size — a large PNG (often 150KB-1MB+) downloads in
 * chunks on mobile and renders "kat kat" on every reload.
 *
 * This applies a transform that:
 *  - `c_limit` — NEVER upscales: small logos stay pixel-perfect (no blur)
 *  - `w_400`   — caps huge uploads to 400px wide (2x retina for a ~190px
 *                navbar logo), so big files get small and fast
 *  - `f_auto`  — serves WebP/AVIF instead of PNG (5-10x smaller)
 *  - `q_auto`  — Cloudinary picks the best quality for the content
 *
 * Non-Cloudinary URLs (local files like /nav-logo.png, uploads, blobs) are
 * returned unchanged.
 */
export const logoImage = (url, { width = 400 } = {}) => {
  if (!url || typeof url !== "string") return url;

  const match = url.match(/^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/);
  if (!match) return url;

  const [, base, rest] = match;
  const parts = rest.split("/");

  // If the URL already has a transformation segment, keep its non-conflicting
  // entries and replace w_/q_/f_/c_ with ours.
  const isTransform = /^[a-z0-9]+_[a-z0-9]+(,[a-z0-9]+_[a-z0-9]+)*$/.test(parts[0] || "");
  const existing = isTransform ? parts.shift() : "";
  const keep = existing.split(",").filter((t) => t && !/^(w|q|f|c)_/.test(t));
  const transform = [...keep, `w_${width}`, "c_limit", "q_auto", "f_auto"].filter(Boolean).join(",");

  return `${base}${transform}/${parts.join("/")}`;
};
