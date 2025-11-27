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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <img
              src="/Logo-footer.png"
              alt="Aldenham Doggy Day Care"
              className="h-16 sm:h-20 w-auto mb-3 sm:mb-4 rounded-lg"
            />
            <p className="text-gray-300 text-xs sm:text-sm">
              Professional doggy day care services with love and care for your furry friends.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#what-we-offer" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm">
                  Client Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Contact Info</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-start">
                <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-canine-gold mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-xs sm:text-sm">
                  Aldenham Doggy Day Care<br />
                  Aldenham Country Park<br />
                  Aldenham Road<br />
                  Elstree, Hertfordshire<br />
                  WD6 3BA
                </span>
              </li>
              <li className="flex items-center">
                <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5 text-canine-gold mr-2 flex-shrink-0" />
                <a href="tel:07963656556" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm">
                  07963 656556
                </a>
              </li>
              <li className="flex items-center">
                <EnvelopeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-canine-gold mr-2 flex-shrink-0" />
                <a href="mailto:admin@aldenhamdoggydaycare.com" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm break-all">
                  admin@aldenhamdoggydaycare.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Opening Hours</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li className="flex items-center">
                <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-canine-gold mr-2 flex-shrink-0" />
                <span className="text-gray-300 text-xs sm:text-sm">
                  Monday - Friday
                </span>
              </li>
              <li className="text-gray-300 text-xs sm:text-sm ml-6 sm:ml-7">
                7:00 AM - 7:00 PM
              </li>
              <li className="flex items-center mt-2 sm:mt-3">
                <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-canine-gold mr-2 flex-shrink-0" />
                <span className="text-gray-300 text-xs sm:text-sm">
                  Weekends & Bank Holidays
                </span>
              </li>
              <li className="text-gray-300 text-xs sm:text-sm ml-6 sm:ml-7">
                Closed
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">
            © 2010 Aldenham Doggy Day Care. All rights reserved. |
            <Link href="/privacy" className="hover:text-white ml-1 sm:ml-2">Privacy Policy</Link> |
            <Link href="/terms" className="hover:text-white ml-1 sm:ml-2">Terms & Conditions</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}