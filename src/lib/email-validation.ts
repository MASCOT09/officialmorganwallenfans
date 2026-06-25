const COMMON_TYPOS: Record<string, string> = {
  ".cmo": ".com",
  ".con": ".com",
  ".comm": ".com",
  ".cpm": ".com",
  ".cm": ".com",
  ".om": ".com",
  ".co": ".com",
  ".nett": ".net",
  ".orgg": ".org",
  "gmial.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gnail.com": "gmail.com",
  "hotmial.com": "hotmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "outlok.com": "outlook.com",
  "outllok.com": "outlook.com",
};

const VALID_TLDS = new Set([
  "com", "net", "org", "edu", "gov", "mil", "io", "co", "uk", "ca", "au", "de",
  "fr", "jp", "in", "us", "info", "biz", "me", "tv", "app", "dev", "fan", "live",
  "music", "email", "pro", "xyz", "online", "site", "club", "world", "store",
]);

export interface EmailValidationResult {
  valid: boolean;
  suggestion?: string;
  error?: string;
}

export function validateEmail(email: string): EmailValidationResult {
  const trimmed = email.trim().toLowerCase();
  const basic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basic.test(trimmed)) {
    return { valid: false, error: "Please enter a valid email address." };
  }

  const [, domain] = trimmed.split("@");
  const tld = domain.split(".").pop() ?? "";
  if (!VALID_TLDS.has(tld)) {
    return { valid: false, error: "That email domain doesn't look valid." };
  }

  for (const [typo, fix] of Object.entries(COMMON_TYPOS)) {
    if (domain.includes(typo.replace(".", "")) && !domain.endsWith(fix)) {
      const suggested = trimmed.replace(domain, domain.replace(typo.replace(".", ""), fix.replace(".", "")));
      if (suggested !== trimmed) {
        return { valid: false, suggestion: suggested, error: `Did you mean ${suggested}?` };
      }
    }
    if (domain === typo.replace(".", "") || domain.endsWith(typo)) {
      const fixedDomain = domain.replace(typo, fix);
      return {
        valid: false,
        suggestion: trimmed.replace(domain, fixedDomain),
        error: `Did you mean ${trimmed.replace(domain, fixedDomain)}?`,
      };
    }
  }

  if (domain.includes("gmail") && domain !== "gmail.com") {
    return { valid: false, suggestion: trimmed.replace(domain, "gmail.com"), error: "Did you mean gmail.com?" };
  }

  return { valid: true };
}
