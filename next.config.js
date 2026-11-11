//@ts-check
const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// The backend origin the browser calls directly for public endpoints; it must
// be allowed by connect-src. Read here, not through env.ts, because this file
// runs in Node before the app code is bundled.
const apiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").origin;
  } catch {
    return null;
  }
})();

/**
 * Content Security Policy, report-only so it can never break a page: the
 * browser reports violations to the console (and to `report-to` once a
 * project adds an endpoint). Promote it to `Content-Security-Policy` once the
 * project's own scripts, styles and image hosts are listed. HSTS belongs on
 * the TLS terminator, not here.
 */
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  ["connect-src 'self'", apiOrigin].filter(Boolean).join(" "),
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
  "form-action 'self'",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    // Add the hosts the project serves images from.
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
