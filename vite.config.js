import { defineConfig } from "vite";

// Relative base so the built assets resolve correctly no matter where the
// site is hosted from — domain root, a subpath (e.g. GitHub Pages project
// sites at /<repo>/), or a custom subdirectory deploy.
export default defineConfig({
  base: "./",
});
