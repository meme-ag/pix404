import { defineConfig } from 'astro/config';
import qwik from "@qwikdev/astro";
import netlify from "@astrojs/netlify/functions";

export default defineConfig({
  integrations: [qwik()],
  output: "server",
  adapter: netlify({
    functionName: 'astro_ssr_handler'
  })
});
