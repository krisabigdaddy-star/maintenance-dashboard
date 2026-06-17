import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  // เปลี่ยน 'your-repo-name' เป็นชื่อ Repository ของคุณใน GitHub
  // ตัวอย่างเช่น หาก URL คือ https://github.com/krisada/maintenance-dash ให้ใส่ '/maintenance-dash/'
  base: '/maintenance-dashboard/', 
  plugins: [
    react(),
    tailwindcss(),
  ],
})