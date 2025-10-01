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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/images/logo.jpeg"
              alt="Canine Paradise"
              width={180}
              height={60}
              className="h-14 w-auto"
            />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-canine-navy hover:text-canine-gold transition-colors font-medium">
              Home
            </Link>
            <Link href="/about" className="text-canine-navy hover:text-canine-gold transition-colors font-medium">
              About Us
            </Link>
            <Link href="/team" className="text-canine-navy hover:text-canine-gold transition-colors font-medium">
              Meet the Team
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
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isOpen ? (
              <XMarkIcon className="h-6 w-6 text-canine-navy" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-canine-navy" />
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
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-4 py-6 space-y-4">
              <Link
                href="/"
                className="block text-canine-navy hover:text-canine-gold transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className="block text-canine-navy hover:text-canine-gold transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/team"
                className="block text-canine-navy hover:text-canine-gold transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Meet the Team
              </Link>
              <Link
                href="/contact"
                className="block text-canine-navy hover:text-canine-gold transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Contact Us
              </Link>
              <div className="pt-4 space-y-3">
                <Link href="/login" className="btn-outline block text-center">
                  Client Portal
                </Link>
                <Link href="/signup" className="btn-primary block text-center">
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