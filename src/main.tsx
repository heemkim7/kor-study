import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import { App } from './app/App'
import { validateContent } from './content/loader'

if (import.meta.env.DEV) {
  const errs = validateContent()
  if (errs.length) console.warn('[content] 검증 경고:', errs)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
)
