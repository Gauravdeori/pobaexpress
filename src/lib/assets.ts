import type { SyntheticEvent } from "react";

import logoAsset from "@/assets/poba-logo.png.asset.json";
import bannerAsset from "@/assets/forest-road.jpg.asset.json";

// Each image is a list of candidates tried in order, first one that loads wins.
//
// Self-hosted copies come first: drop the originals into public/ as
// poba-logo.png and forest-road.jpg and they take over automatically, no code
// change needed. Until then those 404 and the *.asset.json URLs take over —
// but those point at the editor's asset host under /__l5e/, which only resolves
// inside that environment. Once the files are in public/ you can delete the
// hosted entries (and the two .asset.json imports) entirely.

/** Bundled vector mark — the last resort, always present in public/. */
export const LOGO_FALLBACK = "/logo.svg";

const LOGO_SOURCES = ["/poba-logo.png", logoAsset.url, LOGO_FALLBACK];
const BANNER_SOURCES = ["/forest-road.jpg", bannerAsset.url];

export const LOGO_SRC = LOGO_SOURCES[0];
export const BANNER_SRC = BANNER_SOURCES[0];

/** Photos sit on a brand-coloured panel, so hiding one leaves a solid block
 *  rather than a broken-image glyph. `visibility` keeps the box's size. */
function hidePhoto(img: HTMLImageElement) {
  img.style.visibility = "hidden";
}

function advance(img: HTMLImageElement, sources: string[], onExhausted?: () => void) {
  const next = Number(img.dataset.srcIndex ?? "0") + 1;
  if (next >= sources.length) {
    onExhausted?.();
    return;
  }
  img.dataset.srcIndex = String(next);
  img.src = sources[next];
}

// An image that fails while the server-rendered HTML is still parsing has
// already fired its error event by the time React attaches a handler, so each
// pair below also re-checks the settled state when the node mounts:
// `complete` with a zero `naturalWidth` means the load failed.

export function onLogoError(event: SyntheticEvent<HTMLImageElement>) {
  advance(event.currentTarget, LOGO_SOURCES);
}

export function logoRef(img: HTMLImageElement | null) {
  if (img?.complete && img.naturalWidth === 0) advance(img, LOGO_SOURCES);
}

export function onPhotoError(event: SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;
  advance(img, BANNER_SOURCES, () => hidePhoto(img));
}

export function photoRef(img: HTMLImageElement | null) {
  if (img?.complete && img.naturalWidth === 0) advance(img, BANNER_SOURCES, () => hidePhoto(img));
}
