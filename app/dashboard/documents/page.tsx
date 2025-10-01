'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  DocumentTextIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon,
  DocumentCheckIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { DocumentTextIcon as DocumentSolid, CheckBadgeIcon } from '@heroicons/react/24/solid'

export default function DocumentsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [dogs, setDogs] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [selectedDog, setSelectedDog] = useState<string>('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [docType, setDocType] = useState<string>('vaccination')
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Get user's dogs
      const { data: dogsData } = await supabase
        .from('dogs')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })

      setDogs(dogsData || [])

      // Get all documents
      const { data: docsData } = await supabase
        .from('documents')
        .select('*, dogs!inner(name, owner_id)')
        .eq('dogs.owner_id', user.id)
        .order('created_at', { ascending: false })

      setDocuments(docsData || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!uploadFile || !selectedDog) {
      toast.error('Please select a dog and choose a file')
      return
    }

    setUploading(true)
    try {
      // Upload to Supabase Storage
      const fileExt = uploadFile.name.split('.').pop()
      const fileName = `${selectedDog}_${docType}_${Date.now()}.${fileExt}`
      const filePath = `documents/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('dog-documents')
        .upload(filePath, uploadFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('dog-documents')
        .getPublicUrl(filePath)

      // Save to database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          dog_id: selectedDog,
          type: docType,
          file_url: urlData.publicUrl,
          file_name: uploadFile.name,
          uploaded_by: user.id
        })

      if (dbError) throw dbError

      toast.success('Document uploaded successfully! 🎉')
      setShowUploadModal(false)
      setUploadFile(null)
      setSelectedDog('')
      await init()
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (docId: string, fileUrl: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      // Extract file path from URL
      const filePath = fileUrl.split('/').slice(-2).join('/')

      // Delete from storage
      await supabase.storage
        .from('dog-documents')
        .remove([filePath])

      // Delete from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId)

      if (error) throw error

      toast.success('Document deleted successfully')
      await init()
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error(error.message || 'Failed to delete document')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
            <DocumentSolid className="h-6 w-6 text-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading documents...</p>
        </div>
      </div>
    )
  }

  const groupedDocs = dogs.map(dog => ({
    dog,
    docs: documents.filter(doc => doc.dog_id === dog.id)
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard" className="text-green-600 hover:text-green-700 mb-4 inline-flex items-center font-medium group">
              <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>

            {/* Hero Header */}
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl shadow-2xl p-8 mb-6 overflow-hidden"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-10 -right-10 opacity-20"
              >
                <DocumentSolid className="h-40 w-40 text-white" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-10 -left-10 opacity-20"
              >
                <CheckBadgeIcon className="h-32 w-32 text-white" />
              </motion.div>

              <div className="relative z-10">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                      <DocumentTextIcon className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-display font-bold text-white">
                        Documents & Records 📄
                      </h1>
                      <p className="text-white/90 text-lg mt-1">
                        Manage vaccination records and important documents
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUploadModal(true)}
                    className="bg-white text-green-600 px-6 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl flex items-center gap-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Upload Document
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Info Banner */}
          {dogs.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
                <div>
                  <h3 className="font-bold text-amber-900 mb-1">No Dogs Added Yet</h3>
                  <p className="text-amber-800 text-sm">
                    Please add a dog first before uploading documents.
                  </p>
                  <Link href="/dashboard/add-dog">
                    <button className="mt-3 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                      Add Your First Dog
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Documents by Dog */}
          <div className="space-y-6">
            {groupedDocs.map((group, index) => (
              <motion.div
                key={group.dog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-100"
              >
                {/* Dog Header */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-100">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-teal-400 flex items-center justify-center shadow-lg">
                    {group.dog.photo_url ? (
                      <img src={group.dog.photo_url} alt={group.dog.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-white font-bold text-2xl">{group.dog.name[0]}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{group.dog.name}</h2>
                    <p className="text-gray-600">{group.dog.breed}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl px-4 py-2 border-2 border-green-200">
                    <p className="text-sm text-green-700 font-semibold">{group.docs.length} Documents</p>
                  </div>
                </div>

                {/* Documents Grid */}
                {group.docs.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.docs.map((doc, docIndex) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + docIndex * 0.05 }}
                        whileHover={{ scale: 1.03, y: -4 }}
                        className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4 border-2 border-green-200 hover:border-green-400 transition-all shadow-lg hover:shadow-xl"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="bg-green-500 rounded-lg p-2">
                            <DocumentCheckIcon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate">{doc.file_name}</p>
                            <p className="text-xs text-gray-600 capitalize">{doc.type.replace('_', ' ')}</p>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 mb-3">
                          Uploaded: {new Date(doc.created_at).toLocaleDateString('en-GB')}
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1 transition-colors"
                          >
                            <EyeIcon className="h-4 w-4" />
                            View
                          </a>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(doc.id, doc.file_url)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No documents uploaded yet</p>
                    <p className="text-sm text-gray-400 mt-1">Click "Upload Document" to add vaccination records</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-xl p-2">
                  <CloudArrowUpIcon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Upload Document</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </motion.button>
            </div>

            <div className="space-y-4">
              {/* Select Dog */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Dog
                </label>
                <select
                  value={selectedDog}
                  onChange={(e) => setSelectedDog(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                >
                  <option value="">Choose a dog...</option>
                  {dogs.map(dog => (
                    <option key={dog.id} value={dog.id}>{dog.name}</option>
                  ))}
                </select>
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Document Type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                >
                  <option value="vaccination">Vaccination Record</option>
                  <option value="medical">Medical Record</option>
                  <option value="insurance">Insurance Document</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Choose File
                </label>
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 file:font-semibold hover:file:bg-green-100"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Accepted formats: PDF, JPG, PNG (Max 10MB)
                </p>
              </div>

              {uploadFile && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-800 font-medium truncate">
                      {uploadFile.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpload}
                  disabled={uploading || !uploadFile || !selectedDog}
                  className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-4 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  {uploading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="h-5 w-5" />
                      Upload Document
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
