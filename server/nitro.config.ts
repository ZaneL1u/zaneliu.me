import { defineNitroConfig } from 'nitropack/config';

export default defineNitroConfig({
  timing: true,
  // Nitro runs on port 3000 by default, we want 4000
  runtimeConfig: {
    nitro: {
      port: 4000
    }
  }
});
