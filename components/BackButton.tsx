'use client'

import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface BackButtonProps {
  href: string
  label?: string
  className?: string
}

export default function BackButton({ href, label = 'Back to Dashboard', className = '' }: BackButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-canine-navy text-white rounded-lg hover:bg-canine-navy/90 transition-all font-semibold ${className}`}
    >
      <ArrowLeftIcon className="h-5 w-5" />
      {label}
    </Link>
  )
}
