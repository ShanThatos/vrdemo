import glsl from "vite-plugin-glsl";
import { defineConfig } from "vite";

export default defineConfig({
    base: "/vrdemo/",
    server: {
        host: "0.0.0.0",
        https: true
    }, 
    plugins: [glsl()]
});


// glsl plugin: https://www.npmjs.com/package/vite-plugin-glsl