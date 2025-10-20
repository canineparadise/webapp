'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ClockIcon,
  CalendarIcon,
  UserIcon,
  CurrencyPoundIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface NoticeSubscription {
  id: string
  user_id: string
  notice_given_date: string
  cancellation_effective_date: string
  notice_period_days: number
  monthly_price: number
  days_remaining_in_notice: number
  user: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
}

export default function NoticePeriodReport() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [notices, setNotices] = useState<NoticeSubscription[]>([])

  useEffect(() => {
    checkAdminAuth()
    fetchNotices()
  }, [])

  const checkAdminAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      router.push('/dashboard')
      toast.error('Access denied: Admin only')
    }
  }

  const fetchNotices = async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          id,
          user_id,
          notice_given_date,
          cancellation_effective_date,
          notice_period_days,
          monthly_price,
          user:profiles!subscriptions_user_id_fkey (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('cancellation_requested', true)
        .eq('notice_status', 'given')
        .gte('cancellation_effective_date', today)
        .order('cancellation_effective_date', { ascending: true })

      if (error) throw error

      // Calculate days remaining for each
      const noticesWithDays = (data || []).map(notice => {
        const effectiveDate = new Date(notice.cancellation_effective_date)
        const todayDate = new Date()
        const daysRemaining = Math.ceil((effectiveDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24))

        return {
          ...notice,
          user: Array.isArray(notice.user) ? notice.user[0] : notice.user,
          days_remaining_in_notice: daysRemaining
        }
      })

      setNotices(noticesWithDays)
    } catch (error) {
      console.error('Error fetching notices:', error)
      toast.error('Failed to load notice period data')
    } finally {
      setLoading(false)
    }
  }

  const expiringWithin7Days = notices.filter(n => n.days_remaining_in_notice <= 7)
  const expiringWithin14Days = notices.filter(n => n.days_remaining_in_notice > 7 && n.days_remaining_in_notice <= 14)
  const expiringLater = notices.filter(n => n.days_remaining_in_notice > 14)

  const totalMRRAtRisk = notices.reduce((sum, n) => sum + (n.monthly_price || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/staff/admin-dashboard')}
          className="mb-4 flex items-center gap-2 text-canine-navy hover:text-canine-gold transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="font-semibold">Back to Dashboard</span>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-display font-bold text-canine-navy mb-2">
                Notice Period Tracking
              </h1>
              <p className="text-gray-600">Monitor active cancellation notices and pending end dates</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Active Notices</p>
              <p className="text-3xl font-bold text-orange-600">{notices.length}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Expiring in 7 Days</p>
                  <p className="text-3xl font-bold mt-1">{expiringWithin7Days.length}</p>
                </div>
                <ExclamationTriangleIcon className="h-12 w-12 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Expiring in 14 Days</p>
                  <p className="text-3xl font-bold mt-1">{expiringWithin14Days.length}</p>
                </div>
                <ClockIcon className="h-12 w-12 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Expiring Later</p>
                  <p className="text-3xl font-bold mt-1">{expiringLater.length}</p>
                </div>
                <CalendarIcon className="h-12 w-12 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">MRR at Risk</p>
                  <p className="text-3xl font-bold mt-1">£{totalMRRAtRisk.toFixed(0)}</p>
                </div>
                <CurrencyPoundIcon className="h-12 w-12 opacity-50" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notices List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-canine-gold mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading notice periods...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <CheckCircleIcon className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <p className="text-xl text-gray-600 mb-2">No active notice periods</p>
            <p className="text-gray-500">All subscriptions are active with no pending cancellations</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Urgent: Expiring Within 7 Days */}
            {expiringWithin7Days.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <h2 className="text-2xl font-display font-bold text-red-600 mb-4 flex items-center">
                  <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
                  Expiring Within 7 Days ({expiringWithin7Days.length})
                </h2>
                <div className="space-y-3">
                  {expiringWithin7Days.map(notice => (
                    <div
                      key={notice.id}
                      className="bg-red-50 border-2 border-red-300 rounded-xl p-6"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {notice.user.first_name} {notice.user.last_name}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
                            <span>{notice.user.email}</span>
                            <span>{notice.user.phone}</span>
                            <span className="font-semibold">Subscription</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-red-600">{notice.days_remaining_in_notice}</p>
                          <p className="text-sm text-gray-600">days left</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4 pt-4 border-t border-red-200">
                        <div>
                          <p className="text-gray-600">Notice Given</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(notice.notice_given_date).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Ends On</p>
                          <p className="font-semibold text-red-600">
                            {new Date(notice.cancellation_effective_date).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Monthly Loss</p>
                          <p className="font-semibold text-red-600">£{notice.monthly_price.toFixed(2)}/mo</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Warning: Expiring Within 14 Days */}
            {expiringWithin14Days.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <h2 className="text-2xl font-display font-bold text-orange-600 mb-4 flex items-center">
                  <ClockIcon className="h-6 w-6 mr-2" />
                  Expiring Within 14 Days ({expiringWithin14Days.length})
                </h2>
                <div className="space-y-3">
                  {expiringWithin14Days.map(notice => (
                    <div
                      key={notice.id}
                      className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {notice.user.first_name} {notice.user.last_name}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
                            <span>{notice.user.email}</span>
                            <span>{notice.user.phone}</span>
                            <span className="font-semibold">Subscription</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-orange-600">{notice.days_remaining_in_notice}</p>
                          <p className="text-sm text-gray-600">days left</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4 pt-4 border-t border-orange-200">
                        <div>
                          <p className="text-gray-600">Notice Given</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(notice.notice_given_date).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Ends On</p>
                          <p className="font-semibold text-orange-600">
                            {new Date(notice.cancellation_effective_date).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Monthly Loss</p>
                          <p className="font-semibold text-orange-600">£{notice.monthly_price.toFixed(2)}/mo</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Info: Expiring Later */}
            {expiringLater.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <h2 className="text-2xl font-display font-bold text-blue-600 mb-4 flex items-center">
                  <CalendarIcon className="h-6 w-6 mr-2" />
                  Expiring in 15+ Days ({expiringLater.length})
                </h2>
                <div className="space-y-3">
                  {expiringLater.map(notice => (
                    <div
                      key={notice.id}
                      className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {notice.user.first_name} {notice.user.last_name}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
                            <span>{notice.user.email}</span>
                            <span>{notice.user.phone}</span>
                            <span className="font-semibold">Subscription</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-blue-600">{notice.days_remaining_in_notice}</p>
                          <p className="text-sm text-gray-600">days left</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4 pt-4 border-t border-blue-200">
                        <div>
                          <p className="text-gray-600">Notice Given</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(notice.notice_given_date).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Ends On</p>
                          <p className="font-semibold text-blue-600">
                            {new Date(notice.cancellation_effective_date).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Monthly Loss</p>
                          <p className="font-semibold text-blue-600">£{notice.monthly_price.toFixed(2)}/mo</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
