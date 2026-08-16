/**
 * Returns an optimized version of a Cloudinary image URL by injecting
 * width/quality/format transformations (e.g. `w_800,c_limit,q_auto,f_auto`).
 *
 * `c_limit` keeps the image at or below the requested width — Cloudinary will
 * never upscale a smaller original, so small images (like logos) stay sharp.
 *
 * Non-Cloudinary URLs (local files, uploads, blobs) are returned unchanged.
 *
 * Usage:
 *   <img src={optimizeImage(product.images[0].url, { width: 600 })} />
 */
export const optimizeImage = (url, { width = 800, quality = "auto", format = "auto" } = {}) => {
  if (!url || typeof url !== "string") return url;

  const match = url.match(/^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/);
  if (!match) return url;

  const [, base, rest] = match;
  const parts = rest.split("/");

  // Cloudinary transformations are comma-separated key_value pairs (e.g. c_limit,h_1600,q_auto).
  // If the first path segment is one, keep its non-conflicting entries and replace w_/q_/f_ with ours.
  const isTransform = /^[a-z0-9]+_[a-z0-9]+(,[a-z0-9]+_[a-z0-9]+)*$/.test(parts[0] || "");
  const existing = isTransform ? parts.shift() : "";

  const keep = existing.split(",").filter((t) => t && !/^(w|q|f|c)_/.test(t));
  const add = [`w_${width}`, `c_limit`];
  if (quality) add.push(`q_${quality}`);
  if (format) add.push(`f_${format}`);
  const transform = [...keep, ...add].filter(Boolean).join(",");

  return `${base}${transform}/${parts.join("/")}`;
};
