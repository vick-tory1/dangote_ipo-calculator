/** Server-only verified IPO snapshot. Do not put assumptions or calculations here. */
export const DANGOTE_IPO = {
  id: "dangote-petroleum-refinery-2026",
  version: "2026-10-01",
  issuer: "Dangote Petroleum Refinery and Petrochemicals FZE",
  status: "open" as const,
  offerPriceKobo: "52500",
  offerPriceNgn: "525.00",
  offerShares: "4100000000",
  minimumShares: 10,
  quantityIncrement: 10,
  opensOn: "2026-09-14",
  closesOn: "2026-10-13",
  fees: null,
  dividend: null,
  termsNote: "Allotment may be scaled back in an oversubscribed offer. Read the approved prospectus before subscribing.",
  lastVerified: "2026-10-01",
  sources: [
    { label: "Dangote IPO official site", url: "https://ipo.dangote.com/" },
    { label: "Securities and Exchange Commission Nigeria notice", url: "https://sec.gov.ng/for-investors/keep-track-of-circulars/dangote-petroleum-refinery-and-petrochemicals-initial-public-offering/" },
    { label: "Nigerian Exchange Group announcement", url: "https://ngxgroup.com/dangote-sounds-ngx-gong-as-refinery-ipo-opens/" }
  ]
} as const;

export function publicIpoConfig() {
  return { ...DANGOTE_IPO, dataClassification: "verified", unavailable: { fees: true, dividend: true, marketPrice: true } };
}
