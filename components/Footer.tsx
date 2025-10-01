'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

export default function Footer() {
  return (
    <footer id="contact" className="bg-canine-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <img
              src="/logo.jpeg"
              alt="Canine Paradise"
              className="h-20 w-auto mb-4 rounded-lg"
            />
            <p className="text-gray-300 text-sm">
              Professional doggy day care services with love and care for your furry friends.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#what-we-offer" className="text-gray-300 hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-gray-300 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                  Client Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-canine-gold mr-2 mt-0.5" />
                <span className="text-gray-300 text-sm">
                  Canine Paradise<br />
                  Elstree Road<br />
                  Elstree, WD6 3FS
                </span>
              </li>
              <li className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-canine-gold mr-2" />
                <a href="tel:07963656556" className="text-gray-300 hover:text-white transition-colors text-sm">
                  07963 656556
                </a>
              </li>
              <li className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-canine-gold mr-2" />
                <a href="mailto:wecare@canineparadise.com" className="text-gray-300 hover:text-white transition-colors text-sm">
                  wecare@canineparadise.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Opening Hours</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <ClockIcon className="h-5 w-5 text-canine-gold mr-2" />
                <span className="text-gray-300 text-sm">
                  Monday - Friday
                </span>
              </li>
              <li className="text-gray-300 text-sm ml-7">
                7:00 AM - 7:00 PM
              </li>
              <li className="flex items-center mt-3">
                <ClockIcon className="h-5 w-5 text-canine-gold mr-2" />
                <span className="text-gray-300 text-sm">
                  Weekends & Bank Holidays
                </span>
              </li>
              <li className="text-gray-300 text-sm ml-7">
                Closed
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2010 Canine Paradise. All rights reserved. |
              <Link href="/privacy" className="hover:text-white ml-2">Privacy Policy</Link> |
              <Link href="/terms" className="hover:text-white ml-2">Terms & Conditions</Link>
            </p>
            <Link
              href="/staff"
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}