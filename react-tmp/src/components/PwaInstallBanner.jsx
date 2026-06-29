import { useState, useEffect } from 'react'

export default function PwaInstallBanner() {
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function installPWA() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then(() => {
      setDeferredPrompt(null)
      setShow(false)
    })
  }

  function dismissPWA() {
    setShow(false)
    setDeferredPrompt(null)
  }

  if (!show) return null

  return (
    <div className="pwa-install-banner" id="pwa-install-banner" style={{ display: 'flex' }} onClick={installPWA}>
      <i className="ti ti-download"></i>
      <span>Instalar Mu Finance</span>
      <button className="close-banner" onClick={(e) => { e.stopPropagation(); dismissPWA() }}>&times;</button>
    </div>
  )
}
