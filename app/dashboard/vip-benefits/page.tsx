'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardHeader from '@/components/DashboardHeader'
import {
  StarIcon,
  GiftIcon,
  TicketIcon,
  SparklesIcon,
  CheckCircleIcon,
  HeartIcon
} from '@heroicons/react/24/solid'

export default function VIPBenefitsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setProfile(profileData)
    setLoading(false)

    // If not a VIP member, redirect to dashboard
    if (!profileData?.is_vip_member) {
      router.push('/dashboard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-canine-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-canine-gold"></div>
      </div>
    )
  }

  const benefits = [
    {
      icon: TicketIcon,
      title: '10% Off All Bookings',
      description: 'Enjoy 10% discount on subscription days, individual days, extra days, and assessments.',
      highlight: true
    },
    {
      icon: SparklesIcon,
      title: 'Priority Booking',
      description: 'Get first access to book popular dates and times before they fill up.'
    },
    {
      icon: GiftIcon,
      title: 'Exclusive Offers',
      description: 'Receive special VIP-only promotions and seasonal discounts throughout the year.'
    },
    {
      icon: HeartIcon,
      title: 'VIP Recognition',
      description: 'Your pup gets extra attention and care as a valued member of our Golden Paw family.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <DashboardHeader
          title="Golden Paw VIP Benefits"
          subtitle="Thank you for being a valued VIP member"
        />

        {/* VIP Card */}
        <div className="relative bg-gradient-to-br from-canine-navy via-[#1e4562] to-canine-navy rounded-3xl p-8 mb-8 overflow-hidden shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-canine-gold/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-canine-gold/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <img src="/VIP.png" alt="VIP Badge" className="h-24 w-24 object-contain" />
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <StarIcon className="h-6 w-6 text-canine-gold" />
                <h2 className="text-2xl font-bold text-white">Golden Paw VIP</h2>
                <StarIcon className="h-6 w-6 text-canine-gold" />
              </div>
              <p className="text-canine-gold font-semibold text-lg mb-1">
                {profile?.first_name} {profile?.last_name}
              </p>
              <p className="text-gray-400 text-sm">
                Member since {new Date(profile?.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl p-6 shadow-sm border ${
                benefit.highlight
                  ? 'border-canine-gold ring-2 ring-canine-gold/20'
                  : 'border-gray-100'
              }`}
            >
              <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl mb-4 ${
                benefit.highlight
                  ? 'bg-gradient-to-br from-canine-gold to-canine-light-gold'
                  : 'bg-canine-gold/10'
              }`}>
                <benefit.icon className={`h-6 w-6 ${benefit.highlight ? 'text-white' : 'text-canine-gold'}`} />
              </div>
              <h3 className="text-lg font-bold text-canine-navy mb-2">{benefit.title}</h3>
              <p className="text-gray-600 text-sm">{benefit.description}</p>
              {benefit.highlight && (
                <div className="mt-4 flex items-center gap-2 text-canine-gold text-sm font-medium">
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Applied automatically at checkout</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-canine-navy mb-4">How Your Discount Works</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-canine-gold/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-canine-gold font-bold text-sm">1</span>
              </div>
              <p className="text-gray-600 text-sm">Your 10% VIP discount is automatically applied to all bookings.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-canine-gold/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-canine-gold font-bold text-sm">2</span>
              </div>
              <p className="text-gray-600 text-sm">The discount appears during checkout - no code needed!</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-canine-gold/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-canine-gold font-bold text-sm">3</span>
              </div>
              <p className="text-gray-600 text-sm">Applies to subscription payments, individual days, extra days, and assessments.</p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Questions about your VIP membership? Contact us at <a href="mailto:hello@aldenhamdoggydaycare.co.uk" className="text-canine-gold hover:underline">hello@aldenhamdoggydaycare.co.uk</a></p>
        </div>
      </div>
    </div>
  )
}
