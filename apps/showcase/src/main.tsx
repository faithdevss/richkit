import React from 'react'
import ReactDOM from 'react-dom/client'
import { setLicenseKey } from '@richkitjs/license'
import { App } from './App'
import './site-base.css'
import '@richkitjs/editors/style.css'
import './showcase.css'

// The showcase runs Pro demos on a production host, so it carries its own
// domain-bound key. Unset (forks, local dev) is fine: localhost needs none.
if (import.meta.env.VITE_RICHKIT_LICENSE_KEY)
  setLicenseKey(import.meta.env.VITE_RICHKIT_LICENSE_KEY)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
