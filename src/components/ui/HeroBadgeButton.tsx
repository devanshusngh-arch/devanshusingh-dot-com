'use client'

import React from 'react'
import HeroBadge from './HeroBadge'
import { Brain, ArrowRight } from 'lucide-react'

export default function HeroBadgeButton() {
  return (
    <HeroBadge
      href="/brand-board"
      text="AI Brand Strategist"
      icon={<Brain className="h-3.5 w-3.5 text-indigo-300" />}
      endIcon={<ArrowRight className="h-3.5 w-3.5 text-neutral-400" />}
      className="relative z-10 border border-white/20 text-white transition-all duration-300 hover:border-white/40 hover:bg-white/[0.06]"
      size="md"
    />
  )
}
