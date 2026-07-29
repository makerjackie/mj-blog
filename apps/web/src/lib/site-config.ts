import { localizeSiteSettings, siteSettings, type SupportedLocale } from "@repo/core";

export function getSiteSettings(locale?: SupportedLocale) {
  return locale ? localizeSiteSettings(siteSettings, locale) : siteSettings;
}
