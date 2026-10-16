// Intrinsic sizes of images in /public, so next/image never guesses an aspect ratio.
// Regenerate when images change.
export const imageSizes: Record<string, readonly [number, number]> = {
  "/work/oyg/admin-dashboard.webp": [1365, 643],
  "/work/oyg/enrollment-checklist.webp": [522, 638],
  "/work/oyg/event-detail.webp": [1350, 640],
  "/work/oyg/landing-desktop.webp": [1366, 642],
  "/work/oyg/landing-mobile.webp": [900, 1951],
  "/work/oyg/payment-verification.webp": [1362, 639],
  "/work/webkeun-invitation/digital-envelope.webp": [900, 1777],
  "/work/webkeun-invitation/rsvp-wishes.webp": [900, 1777],
  "/work/webkeun-invitation/theme-art-sunda.webp": [900, 1777],
  "/work/webkeun-invitation/theme-biru-porselen.webp": [900, 1777],
  "/work/webkeun-invitation/theme-catalog.webp": [2000, 1125],
  "/work/webkeun-invitation/theme-luxury.webp": [900, 1777],
  "/work/webkeun-invitation/theme-oriental-peony.webp": [900, 1777],
  "/work/webkeun-invitation/theme-pranata-jawa.webp": [900, 1777],
  "/work/webkeun-invitation/webkeun-home.webp": [2000, 1125],
  "/work/webkeun-templates/bahtera-logistik.webp": [2000, 1125],
  "/work/webkeun-templates/kawalu-coffee.webp": [2000, 1125],
  "/work/webkeun-templates/laju-fleet.webp": [2000, 1125],
  "/work/webkeun-templates/laju-jogja.webp": [2000, 1125],
  "/work/webkeun-templates/laju-planner.webp": [2000, 1125],
  "/work/webkeun-templates/laras-kinanti.webp": [2000, 1125],
  "/work/webkeun-templates/seungit-laundry.webp": [2000, 1125],
  "/work/webkeun-templates/seungit-pricing.webp": [2000, 1125],
  "/images/hafidz-casual.jpg": [1024, 1536],
  "/images/hafidz-formal-crossed.jpg": [1024, 1536],
  "/images/hafidz-formal.jpg": [1024, 1536],
  "/certificates/dicoding-python.jpg": [1600, 1131],
  "/certificates/oyg-internship.jpg": [1600, 1131],
};

export function sizeOf(src: string) {
  const s = imageSizes[src];
  if (!s) throw new Error(`Missing image size for ${src}`);
  return { width: s[0], height: s[1] };
}
