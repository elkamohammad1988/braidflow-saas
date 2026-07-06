// Curated stock imagery for the demo.
// -----------------------------------------------------------------------------
// Royalty-free photography from Unsplash (Unsplash License — free for commercial
// and non-commercial use, no permission or attribution required). We use
// craft-focused, face-free shots — braided hair, clean parts, studio interiors —
// so the demo's fictional studios never imply a real person's endorsement.
//
// `images.unsplash.com` is whitelisted in next.config.mjs, so next/image
// optimizes, lazy-loads and serves responsive sizes for every one of these.
// To rebrand: swap the photo IDs below (or point the URLs at your own CDN).

const unsplash = (id: string, w = 1400): string =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=72`;

// Braided-hair photography (no faces) — used for braider hero + directory cards.
export const BRAID_PHOTOS = {
  boxBraidsTop: unsplash('1594254773847-9fce26e950bc'), // box braids, clean parts, top-down
  triangleParts: unsplash('1592328906746-0a3ca0bde253'), // fresh triangle parts, top-down
  longBeaded: unsplash('1648010035195-6b0a56e14667'), // long box braids with beads, back view
  feedInClose: unsplash('1757866332825-42368c1105e8'), // feed-in braids, macro
  sectionsClose: unsplash('1757866332840-230be07b786e') // parted sections, macro
} as const;

// Warm studio / salon interiors — used for marketing accents + profile gallery.
export const STUDIO_PHOTOS = {
  warmInterior: unsplash('1626383137804-ff908d2753a2'), // warm row of chairs, wood floor
  brightStation: unsplash('1626379501846-0df4067b8bb9'), // bright station + products
  serviceInAction: unsplash('1695527081848-1e46c06e6458') // stylist at work by a window
} as const;

// A soft, warm low-res blur used as the next/image placeholder so photos fade
// in instead of popping. A pre-encoded warm-cream → clay gradient (client-safe:
// no Buffer, so this module can be imported from client components too).
export const WARM_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjEwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNlN2Q4YmYiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNjOTlhNWYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSIxMCIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==';

// A small, ordered set of craft shots for the profile "recent work" gallery.
export const GALLERY_PHOTOS: string[] = [
  BRAID_PHOTOS.feedInClose,
  BRAID_PHOTOS.sectionsClose,
  BRAID_PHOTOS.boxBraidsTop,
  STUDIO_PHOTOS.brightStation
];
