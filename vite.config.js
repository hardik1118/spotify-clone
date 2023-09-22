import { defineConfig, loadEnv } from "vite";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), "") };
  return {
    // vite config
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    root: "src",
  };
});
