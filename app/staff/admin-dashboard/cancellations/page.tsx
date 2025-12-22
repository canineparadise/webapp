'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import BackButton from '@/components/BackButton'

interface Cancellation {
  id: string
  user_id: string
  tier_id: string
  dog_id: string | null
  is_active: boolean
  cancellation_requested: boolean
  cancelled_at: string | null
  cancellation_date: string | null
  cancellation_effective_date: string | null
  cancellation_reason: string | null
  cancellation_reason_category: string | null
  notice_given_date: string | null
  notice_period_days: number | null
  monthly_price: number
  user: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
  tier: {
    name: string
  }
  dog: {
    name: string
  } | null
}

export default function CancellationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [cancellations, setCancellations] = useState<Cancellation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  useEffect(() => {
    checkAdminAuth()
    fetchCancellations()
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

  const fetchCancellations = async () => {
    setLoading(true)
    try {
      // Fetch subscriptions that are either inactive OR have cancellation requested
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          id,
          user_id,
          tier_id,
          dog_id,
          is_active,
          cancellation_requested,
          cancelled_at,
          cancellation_date,
          cancellation_effective_date,
          cancellation_reason,
          cancellation_reason_category,
          notice_given_date,
          notice_period_days,
          monthly_price,
          user:profiles!subscriptions_user_id_fkey (
            first_name,
            last_name,
            email,
            phone
          ),
          tier:subscription_tiers!subscriptions_tier_id_fkey (
            name
          ),
          dog:dogs!subscriptions_dog_id_fkey (
            name
          )
        `)
        .or('is_active.eq.false,cancellation_requested.eq.true')
        .order('cancelled_at', { ascending: false, nullsFirst: false })

      console.log('Cancellations query result:', { data, error, count: data?.length })

      if (error) throw error

      // Map the data to handle Supabase nested arrays
      const mappedData: Cancellation[] = (data || []).map((item: any) => ({
        ...item,
        user: Array.isArray(item.user) ? item.user[0] : item.user,
        tier: Array.isArray(item.tier) ? item.tier[0] : item.tier,
        dog: Array.isArray(item.dog) ? item.dog[0] : item.dog,
      }))

      setCancellations(mappedData)
    } catch (error) {
      console.error('Error fetching cancellations:', error)
      toast.error('Failed to load cancellations')
    } finally {
      setLoading(false)
    }
  }

  const filteredCancellations = cancellations.filter(c => {
    const matchesSearch =
      c.user?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.user?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dog?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.cancellation_reason || '').toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      filterCategory === 'all' || c.cancellation_reason_category === filterCategory

    return matchesSearch && matchesCategory
  })

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      price: 'Price Too High',
      moving: 'Moving/Relocating',
      dog_behavior: 'Dog Behavior Issues',
      service_quality: 'Service Quality',
      schedule_change: 'Schedule Changes',
      other: 'Other',
    }
    return labels[category] || category
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      price: 'bg-red-100 text-red-800',
      moving: 'bg-blue-100 text-blue-800',
      dog_behavior: 'bg-orange-100 text-orange-800',
      service_quality: 'bg-purple-100 text-purple-800',
      schedule_change: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const totalMRRLost = cancellations.reduce((sum, c) => sum + (c.monthly_price || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="mb-4">
            <BackButton href="/staff/admin-dashboard" />
          </div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-display font-bold text-canine-navy mb-2">
                Subscription Cancellations
              </h1>
              <p className="text-gray-600">View all cancellation requests and reasons</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Cancellations</p>
              <p className="text-3xl font-bold text-red-600">{cancellations.length}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total MRR Lost</p>
                  <p className="text-3xl font-bold mt-1">£{totalMRRLost.toFixed(2)}</p>
                </div>
                <XCircleIcon className="h-12 w-12 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Avg MRR Lost/Cancel</p>
                  <p className="text-3xl font-bold mt-1">
                    £{cancellations.length > 0 ? (totalMRRLost / cancellations.length).toFixed(2) : '0.00'}
                  </p>
                </div>
                <CalendarIcon className="h-12 w-12 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Pending Cancellations</p>
                  <p className="text-3xl font-bold mt-1">
                    {cancellations.filter(c => c.is_active && c.cancellation_requested).length}
                  </p>
                </div>
                <ClockIcon className="h-12 w-12 opacity-50" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or reason..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-300 focus:border-canine-gold outline-none"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-canine-gold outline-none"
            >
              <option value="all">All Categories</option>
              <option value="price">Price Too High</option>
              <option value="moving">Moving/Relocating</option>
              <option value="dog_behavior">Dog Behavior Issues</option>
              <option value="service_quality">Service Quality</option>
              <option value="schedule_change">Schedule Changes</option>
              <option value="other">Other</option>
            </select>
          </div>
        </motion.div>

        {/* Cancellations List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-canine-gold mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading cancellations...</p>
          </div>
        ) : filteredCancellations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <ExclamationTriangleIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-600 mb-2">No cancellations found</p>
            {searchQuery || filterCategory !== 'all' ? (
              <p className="text-gray-500">Try adjusting your filters</p>
            ) : (
              <p className="text-gray-500">Great news! No subscriptions have been cancelled</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCancellations.map((cancellation, index) => (
              <motion.div
                key={cancellation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {cancellation.user?.first_name} {cancellation.user?.last_name}
                        {cancellation.dog?.name && (
                          <span className="text-gray-500 font-normal ml-2">({cancellation.dog.name})</span>
                        )}
                      </h3>
                      {cancellation.cancellation_reason_category ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(cancellation.cancellation_reason_category)}`}>
                          {getCategoryLabel(cancellation.cancellation_reason_category)}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                          Cancelled
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <UserIcon className="h-4 w-4" />
                        <span>{cancellation.user?.email}</span>
                      </span>
                      {cancellation.user?.phone && <span>{cancellation.user.phone}</span>}
                      <span className="font-semibold">{cancellation.tier?.name}</span>
                      <span className="text-red-600 font-bold">-£{(cancellation.monthly_price || 0).toFixed(2)}/mo</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Cancellation Reason:</p>
                  <p className="text-gray-900">
                    {cancellation.cancellation_reason || 'No reason provided (cancelled manually)'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Cancelled Date</p>
                    <p className="font-semibold text-gray-900">
                      {cancellation.cancelled_at
                        ? new Date(cancellation.cancelled_at).toLocaleDateString('en-GB')
                        : cancellation.notice_given_date
                        ? new Date(cancellation.notice_given_date).toLocaleDateString('en-GB')
                        : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Effective Date</p>
                    <p className="font-semibold text-gray-900">
                      {cancellation.cancellation_effective_date
                        ? new Date(cancellation.cancellation_effective_date).toLocaleDateString('en-GB')
                        : 'Immediate'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className={`font-semibold ${cancellation.is_active ? 'text-orange-600' : 'text-red-600'}`}>
                      {cancellation.is_active ? 'Pending Cancellation' : 'Cancelled'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
