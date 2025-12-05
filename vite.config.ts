import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // 修改这里来改变端口，例如改成 3001
    host: true, // 允许外部访问
  },
})
