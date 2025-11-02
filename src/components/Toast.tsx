import React, { useEffect } from 'react'

interface ToastProps {
  message: string
  duration?: number
  onClose?: () => void
}

export default function Toast({ message, duration = 2000, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(() => onClose && onClose(), duration)
    return () => clearTimeout(t)
  }, [duration, onClose])

  if (!message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        background: 'rgba(0,0,0,0.75)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: 8,
        zIndex: 9999,
        boxShadow: '0 6px 18px rgba(0,0,0,0.12)'
      }}
    >
      {message}
    </div>
  )
}
