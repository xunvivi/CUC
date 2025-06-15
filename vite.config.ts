import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/CUC/', // ✅ 这里是你仓库的名字
  plugins: [vue()],
})

