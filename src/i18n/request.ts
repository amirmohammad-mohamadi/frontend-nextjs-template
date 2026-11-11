// Loaded by the next-intl plugin (see next.config.js). `getRequestConfig` from
// "next-intl/server" is an identity function, so the config is exported as a
// plain function; that also keeps this module free of server-only imports.
import { isAppLocale } from "./locales";
import { routing } from "./routing";

export default async function requestConfig({
  requestLocale,
}: {
  requestLocale: Promise<string | undefined>;
}) {
  const requested = await requestLocale;
  const locale = isAppLocale(requested) ? requested : routing.defaultLocale;
  const messages = (await import(`../../messages/${locale}.json`, { with: { type: "json" } }))
    .default;
  return { locale, messages };
}
