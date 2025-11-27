'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  CurrencyPoundIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import BackButton from '@/components/BackButton'

interface DailyData {
  date: string
  attendance: number
  revenue: number
}

interface SubscriptionTierCount {
  tier_name: string
  count: number
  percentage: number
  color: string
}

interface CancellationReasonCount {
  category: string
  count: number
  percentage: number
  color: string
}

type ViewMode = 'weekly' | 'monthly' | 'yearly'

export default function Analytics() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('weekly')
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [subscriptionDistribution, setSubscriptionDistribution] = useState<SubscriptionTierCount[]>([])
  const [cancellationReasons, setCancellationReasons] = useState<CancellationReasonCount[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalAttendance, setTotalAttendance] = useState(0)
  const [averageRevenue, setAverageRevenue] = useState(0)
  const [averageAttendance, setAverageAttendance] = useState(0)

  useEffect(() => {
    checkAdminAuth()
  }, [])

  useEffect(() => {
    fetchAnalyticsData()
  }, [viewMode])

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

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchRevenueAndAttendance(),
        fetchSubscriptionDistribution(),
        fetchCancellationReasons(),
      ])
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const getDateRange = () => {
    const today = new Date()
    let startDate = new Date()

    switch (viewMode) {
      case 'weekly':
        startDate.setDate(today.getDate() - 7)
        break
      case 'monthly':
        startDate.setMonth(today.getMonth() - 1)
        break
      case 'yearly':
        startDate.setFullYear(today.getFullYear() - 1)
        break
    }

    return {
      start: startDate.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    }
  }

  const fetchRevenueAndAttendance = async () => {
    const { start, end } = getDateRange()

    // Fetch regular bookings within date range
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('booking_date, dog_ids, amount')
      .gte('booking_date', start)
      .lte('booking_date', end)
      .in('status', ['confirmed', 'completed'])
      .order('booking_date', { ascending: true })

    if (error) {
      console.error('Error fetching bookings:', error)
      return
    }

    // Fetch assessment bookings within date range
    const { data: assessmentBookings } = await supabase
      .from('assessment_bookings')
      .select('booked_at, slot_id')
      .eq('booking_status', 'confirmed')
      .gte('booked_at', start)
      .lte('booked_at', end)

    // Group by date
    const dataMap: Record<string, { attendance: number; revenue: number }> = {}

    bookings?.forEach(booking => {
      const date = booking.booking_date
      if (!dataMap[date]) {
        dataMap[date] = { attendance: 0, revenue: 0 }
      }
      dataMap[date].attendance += (booking.dog_ids?.length || 0)
      dataMap[date].revenue += (booking.amount || 0)
    })

    // Add assessment bookings to revenue (each assessment is 1 dog, £40)
    assessmentBookings?.forEach(assessment => {
      const date = assessment.booked_at.split('T')[0] // Extract date from timestamp
      if (!dataMap[date]) {
        dataMap[date] = { attendance: 0, revenue: 0 }
      }
      dataMap[date].attendance += 1
      dataMap[date].revenue += 40
    })

    // Convert to array and sort
    const data: DailyData[] = Object.entries(dataMap)
      .map(([date, values]) => ({
        date,
        attendance: values.attendance,
        revenue: values.revenue,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    setDailyData(data)

    // Calculate totals and averages
    const totRevenue = data.reduce((sum, d) => sum + d.revenue, 0)
    const totAttendance = data.reduce((sum, d) => sum + d.attendance, 0)
    setTotalRevenue(totRevenue)
    setTotalAttendance(totAttendance)
    setAverageRevenue(data.length > 0 ? totRevenue / data.length : 0)
    setAverageAttendance(data.length > 0 ? totAttendance / data.length : 0)
  }

  const fetchSubscriptionDistribution = async () => {
    // Fetch active subscriptions - tier info not available
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('id, monthly_price')
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return
    }

    // Group by monthly price as proxy for tier
    const tierCounts: Record<string, number> = {}
    let total = 0

    subscriptions?.forEach(sub => {
      const tierName = sub.monthly_price ? `£${sub.monthly_price}/month` : 'Unknown'
      tierCounts[tierName] = (tierCounts[tierName] || 0) + 1
      total++
    })

    // Define colors for each tier
    const tierColors: Record<string, string> = {
      'Small Package': '#fbbf24',
      'Medium Package': '#60a5fa',
      'Large Package': '#34d399',
      'Extra Large Package': '#a78bfa',
    }

    // Convert to array with percentages
    const distribution: SubscriptionTierCount[] = Object.entries(tierCounts).map(([name, count]) => ({
      tier_name: name,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
      color: tierColors[name] || '#9ca3af',
    }))

    setSubscriptionDistribution(distribution)
  }

  const fetchCancellationReasons = async () => {
    // Fetch all cancellations with reasons
    const { data: cancellations, error } = await supabase
      .from('subscriptions')
      .select('cancellation_reason_category')
      .eq('cancellation_requested', true)
      .not('cancellation_reason_category', 'is', null)

    if (error) {
      console.error('Error fetching cancellations:', error)
      return
    }

    // Count by category
    const categoryCounts: Record<string, number> = {}
    let total = 0

    cancellations?.forEach(c => {
      const category = c.cancellation_reason_category || 'other'
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
      total++
    })

    // Define colors and labels for each category
    const categoryInfo: Record<string, { label: string; color: string }> = {
      price: { label: 'Price Too High', color: '#ef4444' },
      moving: { label: 'Moving/Relocating', color: '#3b82f6' },
      dog_behavior: { label: 'Dog Behavior', color: '#f97316' },
      service_quality: { label: 'Service Quality', color: '#a855f7' },
      schedule_change: { label: 'Schedule Changes', color: '#eab308' },
      other: { label: 'Other', color: '#6b7280' },
    }

    // Convert to array with percentages
    const reasons: CancellationReasonCount[] = Object.entries(categoryCounts).map(([category, count]) => ({
      category: categoryInfo[category]?.label || category,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
      color: categoryInfo[category]?.color || '#9ca3af',
    }))

    setCancellationReasons(reasons)
  }

  const maxRevenue = Math.max(...dailyData.map(d => d.revenue), 1)
  const maxAttendance = Math.max(...dailyData.map(d => d.attendance), 1)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (viewMode === 'yearly') {
      return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    } else if (viewMode === 'monthly') {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    } else {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8"
        >
          <div className="mb-4">
            <BackButton href="/staff/admin-dashboard" />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-canine-navy mb-2">
                Analytics & Reports
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Revenue and attendance insights</p>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto">
              <button
                onClick={() => setViewMode('weekly')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-colors ${
                  viewMode === 'weekly'
                    ? 'bg-canine-gold text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-colors ${
                  viewMode === 'monthly'
                    ? 'bg-canine-gold text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setViewMode('yearly')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-colors ${
                  viewMode === 'yearly'
                    ? 'bg-canine-gold text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm opacity-90">Total Revenue</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">£{totalRevenue.toFixed(2)}</p>
                </div>
                <CurrencyPoundIcon className="h-10 w-10 sm:h-12 sm:w-12 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm opacity-90">Total Attendance</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">{totalAttendance}</p>
                </div>
                <UserGroupIcon className="h-10 w-10 sm:h-12 sm:w-12 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm opacity-90">Avg Revenue/Day</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">£{averageRevenue.toFixed(2)}</p>
                </div>
                <ArrowTrendingUpIcon className="h-10 w-10 sm:h-12 sm:w-12 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm opacity-90">Avg Attendance/Day</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">{averageAttendance.toFixed(1)}</p>
                </div>
                <ChartBarIcon className="h-10 w-10 sm:h-12 sm:w-12 opacity-50" />
              </div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-canine-gold mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Revenue vs Attendance Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-display font-bold text-canine-navy mb-6">
                Revenue vs Attendance
              </h2>

              <div className="space-y-6">
                {dailyData.length === 0 ? (
                  <p className="text-gray-500 text-center py-12">No data available for this period</p>
                ) : (
                  dailyData.map((data, index) => (
                    <div key={data.date} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-gray-700 w-24">{formatDate(data.date)}</span>
                        <div className="flex-1 mx-4">
                          <div className="flex items-center space-x-2">
                            {/* Revenue Bar */}
                            <div className="flex-1">
                              <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                                  transition={{ duration: 0.5, delay: index * 0.05 }}
                                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-full flex items-center justify-end px-3"
                                >
                                  <span className="text-xs font-bold text-white">
                                    £{data.revenue.toFixed(2)}
                                  </span>
                                </motion.div>
                              </div>
                            </div>

                            {/* Attendance Bar */}
                            <div className="flex-1">
                              <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(data.attendance / maxAttendance) * 100}%` }}
                                  transition={{ duration: 0.5, delay: index * 0.05 }}
                                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full flex items-center justify-end px-3"
                                >
                                  <span className="text-xs font-bold text-white">
                                    {data.attendance} dogs
                                  </span>
                                </motion.div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center justify-center space-x-8 mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-green-500 to-emerald-600"></div>
                  <span className="text-sm text-gray-600">Revenue</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  <span className="text-sm text-gray-600">Attendance</span>
                </div>
              </div>
            </motion.div>

            {/* Package Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-display font-bold text-canine-navy mb-6">
                Package Distribution
              </h2>

              <div className="space-y-4">
                {subscriptionDistribution.length === 0 ? (
                  <p className="text-gray-500 text-center py-12">No active subscriptions</p>
                ) : (
                  <>
                    {subscriptionDistribution.map((tier, index) => (
                      <div key={tier.tier_name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-700">{tier.tier_name}</span>
                          <span className="text-sm text-gray-600">
                            {tier.count} ({tier.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${tier.percentage}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            style={{ backgroundColor: tier.color }}
                            className="h-full flex items-center justify-center"
                          >
                            <span className="text-xs font-bold text-white">
                              {tier.percentage > 10 && `${tier.count} subscriptions`}
                            </span>
                          </motion.div>
                        </div>
                      </div>
                    ))}

                    {/* Legend */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-200">
                      {subscriptionDistribution.map(tier => (
                        <div key={tier.tier_name} className="flex items-center space-x-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: tier.color }}
                          ></div>
                          <span className="text-sm text-gray-600">{tier.tier_name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Cancellation Reasons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-display font-bold text-canine-navy mb-6">
                Cancellation Reasons
              </h2>

              <div className="space-y-4">
                {cancellationReasons.length === 0 ? (
                  <p className="text-gray-500 text-center py-12">No cancellations recorded</p>
                ) : (
                  <>
                    {cancellationReasons.map((reason, index) => (
                      <div key={reason.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-700">{reason.category}</span>
                          <span className="text-sm text-gray-600">
                            {reason.count} ({reason.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${reason.percentage}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            style={{ backgroundColor: reason.color }}
                            className="h-full flex items-center justify-center"
                          >
                            <span className="text-xs font-bold text-white">
                              {reason.percentage > 10 && `${reason.count}`}
                            </span>
                          </motion.div>
                        </div>
                      </div>
                    ))}

                    {/* Legend */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200">
                      {cancellationReasons.map(reason => (
                        <div key={reason.category} className="flex items-center space-x-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: reason.color }}
                          ></div>
                          <span className="text-sm text-gray-600">{reason.category}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-800">
                        <strong>Total Cancellations:</strong> {cancellationReasons.reduce((sum, r) => sum + r.count, 0)}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        View detailed cancellation information in the Cancellations page
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
