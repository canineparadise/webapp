'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'

export default function UserApprovalsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [pendingUsers, setPendingUsers] = useState<any[]>([])
  const [approvedUsers, setApprovedUsers] = useState<any[]>([])
  const [rejectedUsers, setRejectedUsers] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    try {
      // Check auth and role
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/login')
        return
      }

      // Get user details and verify staff/admin role
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!userData || (userData.role !== 'staff' && userData.role !== 'admin')) {
        router.push('/dashboard')
        return
      }

      setUser(userData)
      await loadUsers()

    } catch (error) {
      console.error('Init error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      // Get all users with their approval status
      const { data: usersData } = await supabase
        .from('pending_user_approvals')
        .select('*')

      if (usersData) {
        setPendingUsers(usersData.filter(u => u.approval_status === 'pending'))
        setApprovedUsers(usersData.filter(u => u.approval_status === 'approved'))
        setRejectedUsers(usersData.filter(u => u.approval_status === 'rejected'))
      }
    } catch (error) {
      console.error('Load users error:', error)
    }
  }

  const handleApprove = async (userId: string) => {
    setProcessing(userId)
    try {
      const { data, error } = await supabase.rpc('approve_user', {
        p_user_id: userId,
        p_staff_id: user.id,
        p_notes: notes || null
      })

      if (error) throw error

      if (data.success) {
        toast.success('User approved successfully!')
        setSelectedUser(null)
        setNotes('')
        await loadUsers()
      } else {
        toast.error(data.error || 'Failed to approve user')
      }
    } catch (error: any) {
      console.error('Approve error:', error)
      toast.error('Failed to approve user')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (userId: string) => {
    if (!notes.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }

    setProcessing(userId)
    try {
      const { data, error } = await supabase.rpc('reject_user', {
        p_user_id: userId,
        p_staff_id: user.id,
        p_notes: notes
      })

      if (error) throw error

      if (data.success) {
        toast.success('User rejected')
        setSelectedUser(null)
        setNotes('')
        await loadUsers()
      } else {
        toast.error(data.error || 'Failed to reject user')
      }
    } catch (error: any) {
      console.error('Reject error:', error)
      toast.error('Failed to reject user')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-canine-gold mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading approvals...</p>
        </div>
      </div>
    )
  }

  const displayUsers = activeTab === 'pending' ? pendingUsers : activeTab === 'approved' ? approvedUsers : rejectedUsers

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <Link href="/staff/dashboard" className="text-canine-gold hover:text-canine-light-gold mb-4 inline-flex items-center">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-display font-bold text-canine-navy flex items-center gap-3">
              <UserGroupIcon className="h-10 w-10 text-canine-gold" />
              User Approvals
            </h1>
            <p className="text-gray-600 mt-2">
              Approve users after their assessment day
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                  activeTab === 'pending'
                    ? 'border-canine-gold text-canine-gold'
                    : 'border-transparent text-gray-600 hover:text-canine-navy'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5" />
                  Pending ({pendingUsers.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                  activeTab === 'approved'
                    ? 'border-canine-gold text-canine-gold'
                    : 'border-transparent text-gray-600 hover:text-canine-navy'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5" />
                  Approved ({approvedUsers.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('rejected')}
                className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                  activeTab === 'rejected'
                    ? 'border-canine-gold text-canine-gold'
                    : 'border-transparent text-gray-600 hover:text-canine-navy'
                }`}
              >
                <div className="flex items-center gap-2">
                  <XCircleIcon className="h-5 w-5" />
                  Rejected ({rejectedUsers.length})
                </div>
              </button>
            </div>
          </div>

          {/* Users List */}
          {displayUsers.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
              <ClockIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No {activeTab} users</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {displayUsers.map((userItem) => (
                <motion.div
                  key={userItem.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-canine-navy mb-2">
                        {userItem.full_name || 'No name provided'}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <EnvelopeIcon className="h-5 w-5 text-canine-gold" />
                          <span className="text-sm">{userItem.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <PhoneIcon className="h-5 w-5 text-canine-gold" />
                          <span className="text-sm">{userItem.phone || 'No phone'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Dogs: {userItem.num_dogs}</span>
                        <span>•</span>
                        <span>Bookings: {userItem.num_bookings}</span>
                        {userItem.latest_booking_date && (
                          <>
                            <span>•</span>
                            <span>Latest booking: {new Date(userItem.latest_booking_date).toLocaleDateString('en-GB')}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>Registered: {new Date(userItem.created_at).toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>

                    {activeTab === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setSelectedUser(userItem)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(userItem)
                            setNotes('')
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                          <XCircleIcon className="h-5 w-5" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Approval/Rejection Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-canine-navy mb-4">
              {processing ? 'Processing...' : `Approve ${selectedUser.full_name}?`}
            </h2>
            <p className="text-gray-600 mb-6">
              Add any notes about this user's assessment (optional for approval, required for rejection):
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Dog is well-socialized, great temperament..."
              className="w-full border-2 border-gray-300 rounded-lg p-3 mb-6 h-32 focus:border-canine-gold focus:outline-none"
              disabled={processing !== null}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setNotes('')
                }}
                disabled={processing !== null}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedUser.id)}
                disabled={processing !== null}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => handleApprove(selectedUser.id)}
                disabled={processing !== null}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Approve
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
