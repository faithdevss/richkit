import React from 'react'
import ReactDOM from 'react-dom/client'
import '@richkitjs/editors/style.css'
import '@richkitjs/extension-math/style.css'
import { Lab } from './Lab'
import './lab.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Lab />
  </React.StrictMode>,
)
