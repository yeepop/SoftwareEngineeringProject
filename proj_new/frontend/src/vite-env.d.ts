/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  // 可以在這裡添加更多環境變數
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
