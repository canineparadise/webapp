'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import BackButton from '@/components/BackButton'

export default function ManualSubscriptionPage() {
  const [email, setEmail] = useState('andrew_carrick@yahoo.co.uk')
  const [tierId, setTierId] = useState('')
  const [days, setDays] = useState('4')
  const [monthlyPrice, setMonthlyPrice] = useState('110.00')
  const [tiers, setTiers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    fetchTiers()
  }, [])

  async function fetchTiers() {
    const { data, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .order('days_per_month')

    if (error) {
      console.error('Error fetching tiers:', error)
      toast.error('Failed to load subscription tiers')
    } else {
      setTiers(data || [])
      // Pre-select "Full Day - 4 days"
      const fullDay4 = data?.find(t =>
        t.name.toLowerCase().includes('full day') && t.days_per_month === 4
      )
      if (fullDay4) {
        setTierId(fullDay4.id)
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      // Step 1: Get user ID from email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .eq('email', email)
        .single()

      if (profileError || !profile) {
        toast.error('User not found with that email')
        setLoading(false)
        return
      }

      // Step 2: Check if subscription already exists
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', profile.id)
        .eq('is_active', true)
        .maybeSingle()

      if (existingSub) {
        toast.error('User already has an active subscription')
        setLoading(false)
        return
      }

      // Step 3: Create subscription
      const startDate = new Date()
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      const pricePerDay = parseFloat(monthlyPrice) / parseInt(days)

      const { data: newSub, error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: profile.id,
          tier_id: tierId,
          days_included: parseInt(days),
          days_remaining: parseInt(days),
          monthly_price: parseFloat(monthlyPrice),
          price_per_day: pricePerDay,
          is_active: true,
          auto_renew: true,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          next_billing_date: endDate.toISOString().split('T')[0],
          payment_status: 'paid',
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating subscription:', insertError)
        toast.error(`Failed to create subscription: ${insertError.message}`)
        setLoading(false)
        return
      }

      toast.success(`Subscription created successfully for ${profile.first_name} ${profile.last_name}!`)

      // Reset form
      setEmail('')
      setDays('4')
      setMonthlyPrice('110.00')

    } catch (error: any) {
      console.error('Unexpected error:', error)
      toast.error(error.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <BackButton href="/staff/admin-dashboard" />
        </div>
        <h1 className="text-3xl font-bold text-canine-navy mb-6">
          Manual Subscription Creation
        </h1>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Emergency Tool:</strong> Use this page to manually create subscriptions when the webhook fails.
            This should only be used for Andrew Carrick's subscription issue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded-lg p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subscription Tier
            </label>
            <select
              value={tierId}
              onChange={(e) => setTierId(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
            >
              <option value="">Select a tier...</option>
              {tiers.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.name} - {tier.days_per_month} days/month (£{tier.base_price})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Days Included
            </label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              required
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Price (£)
            </label>
            <input
              type="number"
              step="0.01"
              value={monthlyPrice}
              onChange={(e) => setMonthlyPrice(e.target.value)}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              For Andrew: £160 - £50 discount = £110
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Summary:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Email: {email}</li>
              <li>Days: {days}</li>
              <li>Monthly Price: £{monthlyPrice}</li>
              <li>Price per Day: £{monthlyPrice && days ? (parseFloat(monthlyPrice) / parseInt(days)).toFixed(2) : '0.00'}</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Subscription...' : 'Create Subscription'}
          </button>
        </form>

        <div className="mt-6">
          <button
            onClick={() => router.push('/staff/admin-dashboard')}
            className="text-canine-navy hover:text-canine-gold"
          >
            ← Back to Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
