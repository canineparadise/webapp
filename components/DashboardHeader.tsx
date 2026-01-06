'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  ChevronDownIcon,
  UserIcon,
  HeartIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftIcon,
  BellIcon,
} from '@heroicons/react/24/outline'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  backButtonHref?: string
  backButtonLabel?: string
}

export default function DashboardHeader({
  title,
  subtitle,
  showBackButton = true,
  backButtonHref = '/dashboard',
  backButtonLabel = 'Back to Dashboard',
}: DashboardHeaderProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [hasActionNeeded, setHasActionNeeded] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        }

        // Check if user has any actions needed (dogs awaiting approval, documents needed, etc.)
        const { data: dogs } = await supabase
          .from('dogs')
          .select('id, is_approved, is_draft')
          .eq('owner_id', user.id)

        const needsAction = dogs?.some(dog => !dog.is_approved && !dog.is_draft)
        setHasActionNeeded(needsAction || false)
      }
    }

    fetchUserData()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    }
    return user?.email?.[0]?.toUpperCase() || 'U'
  }

  const menuItems = [
    { label: 'My Profile', href: '/dashboard/profile', icon: UserIcon },
    { label: 'My Dogs', href: '/dashboard', icon: HeartIcon },
    { label: 'My Bookings', href: '/dashboard/manage-bookings', icon: CalendarDaysIcon },
    { label: 'Manage Subscriptions', href: '/dashboard/subscriptions', icon: CreditCardIcon },
  ]

  return (
    <div className="bg-white/80 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Back button and Title */}
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Link
                href={backButtonHref}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-canine-navy text-white rounded-lg hover:bg-canine-navy/90 transition-all text-sm font-medium"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{backButtonLabel}</span>
              </Link>
            )}
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right side - Notifications and User Dropdown */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <Link
              href="/dashboard"
              className="relative p-2 text-gray-500 hover:text-canine-gold transition-colors"
            >
              <BellIcon className="h-6 w-6" />
              {hasActionNeeded && (
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </Link>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-canine-gold to-canine-light-gold flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {getInitials()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {profile?.first_name || 'User'}
                  </p>
                  {profile?.is_vip_member && (
                    <p className="text-xs text-canine-gold font-medium flex items-center gap-1">
                      <img src="/VIP.png" alt="VIP" className="h-3 w-3 object-contain" />
                      Golden Paw VIP
                    </p>
                  )}
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                    showDropdown ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                  />

                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">
                        {profile?.first_name} {profile?.last_name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                      {profile?.is_vip_member && (
                        <div className="mt-2 flex items-center gap-2 bg-canine-gold/10 rounded-lg px-2 py-1">
                          <img src="/VIP.png" alt="VIP" className="h-5 w-5 object-contain" />
                          <span className="text-xs font-semibold text-canine-gold">Golden Paw VIP - 10% off</span>
                        </div>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {menuItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <item.icon className="h-5 w-5 text-gray-400" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      ))}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        <span className="font-medium">Log Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
