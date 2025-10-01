'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserPlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function UserManagementPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'user'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
      }

      toast.success(`✅ ${data.user.role.toUpperCase()} created: ${data.user.email}`)

      // Reset form
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'user'
      })

    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream to-white p-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-canine-gold/10 p-3 rounded-full">
              <UserPlusIcon className="h-8 w-8 text-canine-gold" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-canine-navy">
                Create User Account
              </h1>
              <p className="text-gray-600">Add users, staff, or admins to the system</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-canine-navy mb-3">
                Account Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['user', 'staff', 'admin'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, role })}
                    className={`p-4 rounded-xl border-2 transition-all font-semibold capitalize ${
                      formData.role === role
                        ? 'border-canine-gold bg-canine-gold/10 text-canine-navy'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-canine-navy mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-canine-gold outline-none transition-all"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-canine-navy mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-canine-gold outline-none transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-canine-navy mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-canine-gold outline-none transition-all"
                placeholder="john@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-canine-navy mb-2">
                Password
              </label>
              <input
                type="text"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-canine-gold outline-none transition-all"
                placeholder="Minimum 6 characters"
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                User will be able to login immediately with this password
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-canine-gold text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-canine-light-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-6 w-6" />
                  Create {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} Account
                </>
              )}
            </motion.button>
          </form>

          {/* Quick Create Demo Accounts */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="font-bold text-canine-navy mb-4">Quick Create Demo Accounts</h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setFormData({
                  email: 'admin@canineparadise.com',
                  password: 'admin123',
                  firstName: 'Admin',
                  lastName: 'User',
                  role: 'admin'
                })}
                className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-all"
              >
                <span className="font-semibold">Admin:</span> admin@canineparadise.com / admin123
              </button>
              <button
                type="button"
                onClick={() => setFormData({
                  email: 'staff@canineparadise.com',
                  password: 'staff123',
                  firstName: 'Staff',
                  lastName: 'User',
                  role: 'staff'
                })}
                className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-all"
              >
                <span className="font-semibold">Staff:</span> staff@canineparadise.com / staff123
              </button>
              <button
                type="button"
                onClick={() => setFormData({
                  email: 'user@canineparadise.com',
                  password: 'user123',
                  firstName: 'Demo',
                  lastName: 'User',
                  role: 'user'
                })}
                className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-all"
              >
                <span className="font-semibold">User:</span> user@canineparadise.com / user123
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
