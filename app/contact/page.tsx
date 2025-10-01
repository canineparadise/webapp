'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dogName: '',
    message: '',
    preferredContact: 'email',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 1500))

    toast.success('Message sent! We\'ll get back to you within 24 hours.')
    setFormData({
      name: '',
      email: '',
      phone: '',
      dogName: '',
      message: '',
      preferredContact: 'email',
    })
    setLoading(false)
  }

  const contactInfo = [
    {
      icon: MapPinIcon,
      title: 'Visit Us',
      details: ['Canine Paradise', 'Elstree Road', 'Elstree, WD6 3FS'],
    },
    {
      icon: PhoneIcon,
      title: 'Call Us',
      details: ['07963 656556', 'Mon-Fri: 7:00 AM - 7:00 PM'],
    },
    {
      icon: EnvelopeIcon,
      title: 'Email Us',
      details: ['wecare@canineparadise.com', 'We reply within 24 hours'],
    },
    {
      icon: ClockIcon,
      title: 'Opening Hours',
      details: ['Monday - Friday: 7:00 AM - 7:00 PM', 'Weekends & Bank Holidays: Closed'],
    },
  ]

  const faqs = [
    {
      question: 'How do I book an assessment?',
      answer: 'Simply fill out the contact form or give us a call. Assessments are held every Friday.',
    },
    {
      question: 'What should I bring for the assessment?',
      answer: 'Bring your dog\'s vaccination records, any medication they take, and their favorite toy!',
    },
    {
      question: 'Do you offer trial days?',
      answer: 'The assessment day serves as a trial to ensure your dog is comfortable with us.',
    },
    {
      question: 'Can I visit the facility?',
      answer: 'Absolutely! We encourage parents to tour our facility. Just schedule a visit through this form.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream to-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-canine-navy to-canine-gold overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-canine-gold rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">
              Let's Chat!
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Whether you have questions, want to schedule a visit, or just want to talk about
              your dog (we love that!), we're here for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-display font-bold text-canine-navy mb-6">
                  Send Us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dog's Name
                      </label>
                      <input
                        type="text"
                        value={formData.dogName}
                        onChange={(e) => setFormData({ ...formData, dogName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                        placeholder="Buddy"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                        placeholder="07XXX XXXXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How would you prefer we contact you?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="email"
                          checked={formData.preferredContact === 'email'}
                          onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                          className="mr-2 text-canine-gold focus:ring-canine-gold"
                        />
                        <span className="text-gray-700">Email</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="phone"
                          checked={formData.preferredContact === 'phone'}
                          onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                          className="mr-2 text-canine-gold focus:ring-canine-gold"
                        />
                        <span className="text-gray-700">Phone</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canine-gold focus:border-transparent"
                      placeholder="Tell us about your dog and what you're looking for..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <EnvelopeIcon className="h-5 w-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Contact Cards */}
              <div className="grid gap-4">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-xl shadow-lg p-6 flex items-start space-x-4"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-canine-gold/20 rounded-full flex items-center justify-center">
                      <info.icon className="h-6 w-6 text-canine-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-canine-navy mb-1">{info.title}</h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-600 text-sm">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Image Placeholder */}
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://via.placeholder.com/600x400/e8f4f8/1a3a52?text=Happy+Dogs+at+Facility"
                  alt="Canine Paradise Facility"
                  className="w-full h-64 object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-display font-bold text-canine-navy mb-4">
              Find Us Here
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Conveniently located on Elstree Road with easy access and plenty of parking
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden shadow-2xl"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2478.0654347715!2d-0.29737!3d51.6438!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48761c8f6a3b5a3d%3A0x0!2sElstree%20Road%2C%20Elstree%20WD6%203FS!5e0!3m2!1sen!2suk!4v1234567890"
              width="100%"
              height="500"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          </motion.div>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-canine-sky rounded-xl p-6 text-center"
            >
              <h3 className="font-semibold text-canine-navy mb-2">By Car</h3>
              <p className="text-gray-700 text-sm">Free parking available on-site</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-canine-cream rounded-xl p-6 text-center"
            >
              <h3 className="font-semibold text-canine-navy mb-2">By Train</h3>
              <p className="text-gray-700 text-sm">10 min walk from Elstree & Borehamwood station</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-canine-gold/20 rounded-xl p-6 text-center"
            >
              <h3 className="font-semibold text-canine-navy mb-2">By Bus</h3>
              <p className="text-gray-700 text-sm">Routes 107, 292, and 306 stop nearby</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-gradient-to-br from-canine-sky to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-display font-bold text-canine-navy mb-4">
              Quick Questions
            </h2>
            <p className="text-xl text-gray-700">
              Here are answers to what most people ask
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-start">
                  <CheckCircleIcon className="h-6 w-6 text-canine-gold mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-canine-navy mb-2">{faq.question}</h3>
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}