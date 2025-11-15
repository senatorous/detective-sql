import { defineConfig } from 'vite';

const isVercel = process.env.VERCEL === '1';

export default defineConfig({
  base: isVercel ? '/' : '/detective-sql/',
});
