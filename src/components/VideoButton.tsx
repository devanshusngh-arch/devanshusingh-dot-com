'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, X } from 'lucide-react'

interface VideoButtonProps {
  videoId: string
  caption?: string
}

const VideoButton: React.FC<VideoButtonProps> = ({ videoId, caption }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [origin, setOrigin] = useState('center center')
  const btnRef = useRef<HTMLDivElement>(null)

  const handleOpen = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setOrigin(`${r.left + r.width / 2}px ${r.top + r.height / 2}px`)
    }
    setIsOpen(true)
  }

  const handleClose = () => setIsOpen(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    if (isOpen) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen])

  return (
    <>
      <div
        ref={btnRef}
        onClick={handleOpen}
        className="cs-vid group"
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter') handleOpen() }}
      >
        <div className="cs-vid__thumb-wrap">
          <Play size={14} fill="currentColor" className="cs-vid__play-icon" />
        </div>
        {caption && <span className="cs-vid__label">{caption}</span>}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.1 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ transformOrigin: origin }}
              className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 backdrop-blur-sm transition-all duration-200"
                aria-label="Close video"
              >
                <X size={20} />
              </button>

              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={caption || 'Video'}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default VideoButton
