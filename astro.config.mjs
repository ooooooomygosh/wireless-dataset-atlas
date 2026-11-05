import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://wireless-dataset-atlas.vercel.app",
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
  i18n: { defaultLocale: "en", locales: ["en", "zh"], routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false } },
});
