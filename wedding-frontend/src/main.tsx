import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { Toaster } from '@/components/ui/toaster'
import { SparklesCore } from '@/components/ui/sparkles'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SparklesCore
        id="tsparticlesfullpage"
        background="transparent"
        minSize={1.5}
        maxSize={4}
        particleDensity={50}
        className="w-full h-full fixed inset-0 -z-10"
        particleColor="#467889"
        speed={0.5}
      />
      <App />
      <Toaster />
    </BrowserRouter>
  </StrictMode>,
)
