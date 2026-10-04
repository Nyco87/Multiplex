/// <reference types="vite/client" />
import type { MultiplexApi } from '../preload'

declare global {
  interface Window {
    multiplex: MultiplexApi
  }
}
