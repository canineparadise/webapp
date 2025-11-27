'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-20 lg:h-24">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/Logo.png"
              alt="Aldenham Doggy Day Care"
              width={400}
              height={133}
              className="h-10 sm:h-14 md:h-20 lg:h-24 w-auto"
            />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-canine-navy hover:text-canine-gold transition-colors font-medium">
              Home
            </Link>
            <Link href="/about" className="text-canine-navy hover:text-canine-gold transition-colors font-medium">
              About Us
            </Link>
            <Link href="/contact" className="text-canine-navy hover:text-canine-gold transition-colors font-medium">
              Contact Us
            </Link>
            <Link href="/login" className="btn-outline">
              Client Portal
            </Link>
            <Link href="/signup" className="btn-primary">
              Sign Up
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <XMarkIcon className="h-7 w-7 text-canine-navy" />
            ) : (
              <Bars3Icon className="h-7 w-7 text-canine-navy" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t shadow-lg"
          >
            <div className="px-4 py-4 space-y-1">
              <Link
                href="/"
                className="block text-canine-navy hover:bg-canine-cream hover:text-canine-gold transition-all font-medium py-3 px-3 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className="block text-canine-navy hover:bg-canine-cream hover:text-canine-gold transition-all font-medium py-3 px-3 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="block text-canine-navy hover:bg-canine-cream hover:text-canine-gold transition-all font-medium py-3 px-3 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Contact Us
              </Link>
              <div className="pt-3 space-y-2 border-t border-gray-200 mt-3">
                <Link
                  href="/login"
                  className="btn-outline block text-center py-3"
                  onClick={() => setIsOpen(false)}
                >
                  Client Portal
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary block text-center py-3"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}