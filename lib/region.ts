export function detectRegion(): { code: string; currency: string; creditTerm: string } {
  if (typeof window === "undefined") {
    return { code: "GB", currency: "GBP", creditTerm: "Credit file" };
  }
  
  const lang = navigator.language || "en-GB";
  if (lang.startsWith("en-IN") || lang.startsWith("hi")) return { code: "IN", currency: "INR", creditTerm: "CIBIL" };
  if (lang.startsWith("en-AU")) return { code: "AU", currency: "AUD", creditTerm: "Credit report" };
  if (lang.startsWith("en-US")) return { code: "US", currency: "USD", creditTerm: "FICO" };
  if (lang.startsWith("de")) return { code: "DE", currency: "EUR", creditTerm: "SCHUFA" };
  if (lang.startsWith("fr") || lang.startsWith("es") || lang.startsWith("it") || lang.startsWith("nl")) return { code: "EU", currency: "EUR", creditTerm: "Credit score" };
  if (lang.startsWith("ar")) return { code: "SA", currency: "SAR", creditTerm: "Credit score" };
  if (lang.startsWith("id") || lang.startsWith("ms")) return { code: "ID", currency: "IDR", creditTerm: "Credit score" };
  
  // Default UK
  return { code: "GB", currency: "GBP", creditTerm: "Credit file" };
}

export function getRegionRegulation(code: string): string {
  switch (code) {
    case "GB": return "FCA regulation change on 15 July 2026";
    case "IN": return "RBI digital lending guidelines and CIBIL reporting";
    case "AU": return "National Credit Act classification of BNPL as licensed credit";
    case "US": return "FICO 10 BNPL scoring model and credit bureau reporting";
    case "DE":
    case "EU": return "Consumer Credit Directive II (CCD2) mandating SCHUFA/credit bureau checks by 20 Nov 2026";
    case "SA": return "SAMA licensing framework for consumer finance";
    case "ID": return "OJK Regulation 32/2025 for BNPL services";
    default: return "global BNPL credit reporting regulations";
  }
}
