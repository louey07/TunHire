import type { Company, CompanyFormValues } from "@/lib/types";

export const emptyCompanyFormValues: CompanyFormValues = {
  name: "",
  location: "",
  description: "",
  logoUrl: "",
  website: "",
};

export function companyToFormValues(company: Company): CompanyFormValues {
  return {
    name: company.name || "",
    location: company.location || "",
    description: company.description || "",
    logoUrl: company.logoUrl || "",
    website: company.website || "",
  };
}

export function formValuesToUpdatePayload(values: CompanyFormValues) {
  return {
    name: values.name.trim(),
    location: values.location.trim() || null,
    description: values.description.trim() || null,
    logoUrl: values.logoUrl.trim() || null,
    website: values.website.trim() || null,
  };
}

export function validateCompanyForm(values: CompanyFormValues): string | null {
  if (!values.name.trim()) return "Le nom de l'entreprise est requis.";
  if (values.website.trim()) {
    try {
      const url = new URL(
        values.website.trim().startsWith("http")
          ? values.website.trim()
          : `https://${values.website.trim()}`,
      );
      if (!url.hostname) return "L'URL du site web est invalide.";
    } catch {
      return "L'URL du site web est invalide.";
    }
  }
  if (values.logoUrl.trim()) {
    try {
      new URL(values.logoUrl.trim());
    } catch {
      return "L'URL du logo est invalide.";
    }
  }
  return null;
}

export function companyInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export function formatWebsiteDisplay(url: string | null | undefined) {
  if (!url) return null;
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function normalizeWebsiteUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}
