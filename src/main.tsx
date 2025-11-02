import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Small debug badge to show which CSS appears applied in the browser.
try{
  const badge = document.createElement('div')
  badge.id = 'css-debug-badge'
  badge.style.position = 'fixed'
  badge.style.right = '12px'
  badge.style.bottom = '12px'
  badge.style.padding = '6px 10px'
  badge.style.background = 'rgba(0,0,0,0.7)'
  badge.style.color = 'white'
  badge.style.zIndex = '9999'
  badge.style.borderRadius = '6px'
  const bg = getComputedStyle(document.body).backgroundColor
  const applied = /rgb\(|rgba\(/.test(bg) && bg !== 'rgba(0, 0, 0, 0)'
  badge.textContent = `CSS preview: index.css — body bg: ${bg} — applied: ${applied}`
  document.body.appendChild(badge)
}catch(e){/* ignore */}
