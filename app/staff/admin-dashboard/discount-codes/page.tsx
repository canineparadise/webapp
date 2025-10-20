'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TicketIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface DiscountCode {
  id: string
  code: string
  description: string
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  valid_from: string
  valid_until: string | null
  max_uses: number | null
  current_uses: number
  one_time_per_user: boolean
  applies_to: string[]
  min_purchase_amount: number | null
  is_active: boolean
  created_at: string
}

export default function DiscountCodesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [codes, setCodes] = useState<DiscountCode[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [selectedCode, setSelectedCode] = useState<DiscountCode | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed_amount',
    discount_value: 10,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
    max_uses: '',
    one_time_per_user: true,
    applies_to: ['subscription', 'extra_days', 'assessment'],
    min_purchase_amount: '',
    is_active: true,
  })

  useEffect(() => {
    checkAdminAuth()
    fetchDiscountCodes()
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

  const fetchDiscountCodes = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCodes(data || [])
    } catch (error) {
      console.error('Error fetching discount codes:', error)
      toast.error('Failed to load discount codes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('discount_codes')
        .insert({
          code: formData.code.toUpperCase(),
          description: formData.description,
          discount_type: formData.discount_type,
          discount_value: formData.discount_value,
          valid_from: formData.valid_from,
          valid_until: formData.valid_until || null,
          max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
          one_time_per_user: formData.one_time_per_user,
          applies_to: formData.applies_to,
          min_purchase_amount: formData.min_purchase_amount ? parseFloat(formData.min_purchase_amount) : null,
          is_active: formData.is_active,
          created_by: user?.id,
        })

      if (error) throw error

      toast.success('Discount code created successfully!')
      setShowCreateModal(false)
      resetForm()
      fetchDiscountCodes()
    } catch (error: any) {
      console.error('Error creating discount code:', error)
      toast.error(error.message || 'Failed to create discount code')
    }
  }

  const handleToggleActive = async (code: DiscountCode) => {
    try {
      const { error } = await supabase
        .from('discount_codes')
        .update({ is_active: !code.is_active })
        .eq('id', code.id)

      if (error) throw error

      toast.success(code.is_active ? 'Code deactivated' : 'Code activated')
      fetchDiscountCodes()
    } catch (error) {
      console.error('Error toggling code status:', error)
      toast.error('Failed to update code status')
    }
  }

  const handleDeleteCode = async (codeId: string) => {
    if (!confirm('Are you sure you want to delete this discount code?')) return

    try {
      const { error } = await supabase
        .from('discount_codes')
        .delete()
        .eq('id', codeId)

      if (error) throw error

      toast.success('Discount code deleted')
      fetchDiscountCodes()
    } catch (error) {
      console.error('Error deleting code:', error)
      toast.error('Failed to delete code')
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 10,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: '',
      max_uses: '',
      one_time_per_user: true,
      applies_to: ['subscription', 'extra_days', 'assessment'],
      min_purchase_amount: '',
      is_active: true,
    })
  }

  const formatDiscountValue = (code: DiscountCode) => {
    if (code.discount_type === 'percentage') {
      return `${code.discount_value}%`
    } else {
      return `£${code.discount_value.toFixed(2)}`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream via-white to-canine-sky py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/staff/admin-dashboard" className="text-canine-navy hover:text-canine-gold mb-4 inline-flex items-center font-medium">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-display font-bold text-canine-navy mb-2">
                Discount Codes
              </h1>
              <p className="text-gray-600">Create and manage promotional discount codes</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-6 py-3 bg-canine-gold text-white rounded-xl hover:bg-canine-light-gold transition-colors font-semibold"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Code
            </button>
          </div>
        </motion.div>

        {/* Codes List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-canine-gold mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading discount codes...</p>
          </div>
        ) : codes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <TicketIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-600 mb-2">No discount codes yet</p>
            <p className="text-gray-500">Create your first code to get started</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {codes.map((code, index) => (
              <motion.div
                key={code.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl shadow-lg p-6 border-2 ${
                  code.is_active ? 'border-green-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-canine-gold/10 px-4 py-2 rounded-lg">
                        <span className="text-2xl font-bold text-canine-navy font-mono">
                          {code.code}
                        </span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        code.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {code.is_active ? 'Active' : 'Inactive'}
                      </div>
                      <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                        {formatDiscountValue(code)} OFF
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">{code.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Applies To</p>
                        <p className="font-semibold text-gray-900">
                          {code.applies_to.join(', ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Usage</p>
                        <p className="font-semibold text-gray-900">
                          {code.current_uses} / {code.max_uses || '∞'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Valid Until</p>
                        <p className="font-semibold text-gray-900">
                          {code.valid_until
                            ? new Date(code.valid_until).toLocaleDateString()
                            : 'No expiry'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Per User</p>
                        <p className="font-semibold text-gray-900">
                          {code.one_time_per_user ? 'One-time' : 'Multiple'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedCode(code)
                        setShowEmailModal(true)
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Email code"
                    >
                      <EnvelopeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(code)}
                      className={`p-2 rounded-lg transition-colors ${
                        code.is_active
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={code.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {code.is_active ? (
                        <XCircleIcon className="h-5 w-5" />
                      ) : (
                        <CheckCircleIcon className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteCode(code.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-3xl font-display font-bold text-canine-navy mb-6">
                  Create Discount Code
                </h2>

                <div className="space-y-4">
                  {/* Code */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="SUMMER2025"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-canine-gold outline-none font-mono text-lg"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="15% off summer promotion"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-canine-gold outline-none"
                    />
                  </div>

                  {/* Discount Type & Value */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Type *
                      </label>
                      <select
                        value={formData.discount_type}
                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-canine-gold outline-none"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed_amount">Fixed Amount (£)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Value *
                      </label>
                      <input
                        type="number"
                        value={formData.discount_value}
                        onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                        min="0"
                        step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-canine-gold outline-none"
                      />
                    </div>
                  </div>

                  {/* Valid Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Valid From
                      </label>
                      <input
                        type="date"
                        value={formData.valid_from}
                        onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-canine-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Valid Until (Optional)
                      </label>
                      <input
                        type="date"
                        value={formData.valid_until}
                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-canine-gold outline-none"
                      />
                    </div>
                  </div>

                  {/* Max Uses & Min Purchase */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Max Uses (Optional)
                      </label>
                      <input
                        type="number"
                        value={formData.max_uses}
                        onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                        placeholder="Unlimited"
                        min="1"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-canine-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Min Purchase £ (Optional)
                      </label>
                      <input
                        type="number"
                        value={formData.min_purchase_amount}
                        onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-canine-gold outline-none"
                      />
                    </div>
                  </div>

                  {/* Applies To */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Applies To
                    </label>
                    <div className="space-y-2">
                      {['subscription', 'extra_days', 'assessment'].map((type) => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.applies_to.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, applies_to: [...formData.applies_to, type] })
                              } else {
                                setFormData({ ...formData, applies_to: formData.applies_to.filter(t => t !== type) })
                              }
                            }}
                            className="mr-2 text-canine-gold focus:ring-canine-gold rounded"
                          />
                          <span className="capitalize">{type.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* One Time Per User */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.one_time_per_user}
                        onChange={(e) => setFormData({ ...formData, one_time_per_user: e.target.checked })}
                        className="mr-2 text-canine-gold focus:ring-canine-gold rounded"
                      />
                      <span className="text-sm font-semibold text-gray-700">One-time use per user</span>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-4 pt-6">
                    <button
                      onClick={handleCreateCode}
                      className="flex-1 px-6 py-3 bg-canine-gold text-white rounded-xl hover:bg-canine-light-gold transition-colors font-semibold"
                    >
                      Create Code
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateModal(false)
                        resetForm()
                      }}
                      className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Modal - Coming next */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md">
              <h3 className="text-2xl font-bold mb-4">Email Discount Code</h3>
              <p className="text-gray-600 mb-4">
                Email functionality coming soon! You can manually share the code: <strong>{selectedCode?.code}</strong>
              </p>
              <button
                onClick={() => setShowEmailModal(false)}
                className="w-full px-6 py-3 bg-canine-gold text-white rounded-xl hover:bg-canine-light-gold transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
