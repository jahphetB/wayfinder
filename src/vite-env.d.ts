/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAP_STYLE_URL?: string
  readonly VITE_LOCATION_MODE?: 'prototype' | 'browser'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
