'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function StaffLogin() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'staff', // staff or admin
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate login - in production, this would connect to your auth service
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock authentication logic
      if (formData.username === 'admin' && formData.password === 'admin123') {
        toast.success('Welcome Admin!')
        router.push('/staff/admin-dashboard')
      } else if (formData.username === 'staff' && formData.password === 'staff123') {
        toast.success('Welcome Staff Member!')
        router.push('/staff/dashboard')
      } else {
        toast.error('Invalid credentials')
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-canine-navy via-canine-navy/90 to-canine-gold/20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-canine-gold/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-md w-full mx-4"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-canine-navy to-canine-gold p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block"
            >
              <div className="bg-white rounded-full p-4 mb-4">
                <ShieldCheckIcon className="h-12 w-12 text-canine-navy" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              Staff Portal
            </h1>
            <p className="text-white/90">
              Canine Paradise Management System
            </p>
          </div>

          {/* Login Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Login As
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'staff' })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.role === 'staff'
                        ? 'border-canine-gold bg-canine-gold/10 text-canine-navy'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <UsersIcon className="h-6 w-6 mx-auto mb-1" />
                    <span className="text-sm font-medium">Staff</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'admin' })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.role === 'admin'
                        ? 'border-canine-gold bg-canine-gold/10 text-canine-navy'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <ShieldCheckIcon className="h-6 w-6 mx-auto mb-1" />
                    <span className="text-sm font-medium">Admin</span>
                  </button>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent transition-all"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent transition-all"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-canine-gold focus:ring-canine-gold border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-canine-navy hover:bg-canine-navy/90 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <LockClosedIcon className="h-5 w-5 mr-2" />
                    Sign In as {formData.role === 'admin' ? 'Admin' : 'Staff'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Back to main site */}
        <div className="text-center mt-6">
          <a href="/" className="text-white/60 hover:text-white text-sm transition-colors">
            ← Back to Main Site
          </a>
        </div>
      </motion.div>
    </div>
  )
}