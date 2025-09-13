import { vitePlugin as remix } from "@remix-run/dev";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [remix(), tailwindcss()],
    server: {
        hmr: {
            port: 5173,
        },
    },
});
