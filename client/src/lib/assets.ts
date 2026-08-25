/** ATLAS TIME — أصول إصدار GitHub: روابط ثابتة تعمل في Netlify وأي استضافة ثابتة. */
const releaseBase = "https://github.com/Alanazi89/atlas-time/releases/download/assets-2026-08-25";

export const atlasAssets = {
  heroHorology: `${releaseBase}/atlas-hero-horology.jpg`,
  mapDisc: `${releaseBase}/atlas-map-disc.jpg`,
  travelAtmosphere: `${releaseBase}/atlas-travel-atmosphere.jpg`,
  logoMark: `${releaseBase}/atlas-logo-mark.png`,
} as const;
