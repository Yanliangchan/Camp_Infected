import { defineConfig } from "vite";
export default defineConfig({
  build: {
    rollupOptions: {
      input: { main: "index.html", review: "review.html", game: "game.html" },
    },
  },
});
