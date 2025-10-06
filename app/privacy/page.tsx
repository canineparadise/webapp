'use client'

import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-canine-cream to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center text-canine-gold hover:text-canine-light-gold mb-8 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-display font-bold text-canine-navy mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                At Canine Paradise, we are committed to protecting your privacy and the security of your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">2. Information We Collect</h2>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <div>
                  <p className="font-semibold mb-2">2.1 Personal Information:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Name, email address, phone number, and postal address</li>
                    <li>Emergency contact information</li>
                    <li>Payment information (processed securely through Stripe)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">2.2 Dog Information:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Dog's name, breed, age, weight, and medical conditions</li>
                    <li>Vaccination records and veterinary information</li>
                    <li>Behavioral notes and dietary requirements</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">2.3 Usage Information:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Booking history and attendance records</li>
                    <li>Check-in and check-out times</li>
                    <li>Staff notes and incident reports</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">2.4 Technical Information:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>IP address, browser type, and device information</li>
                    <li>Cookies and usage analytics</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">3. How We Use Your Information</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-3">We use your information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and manage our doggy daycare services</li>
                  <li>Process bookings and subscription payments</li>
                  <li>Communicate with you about your bookings and our services</li>
                  <li>Maintain health and safety records for your dog</li>
                  <li>Send you updates, photos, and reports about your dog's day</li>
                  <li>Contact you in case of emergencies</li>
                  <li>Improve our services and customer experience</li>
                  <li>Comply with legal obligations and maintain business records</li>
                  <li>Send marketing communications (with your consent)</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">4. Legal Basis for Processing</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>Under UK GDPR, we process your data based on:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Contract Performance:</strong> To provide our services and fulfill our contractual obligations</li>
                  <li><strong>Legitimate Interests:</strong> To operate our business, improve services, and maintain safety</li>
                  <li><strong>Legal Obligation:</strong> To comply with legal and regulatory requirements</li>
                  <li><strong>Consent:</strong> For marketing communications and photography (which you can withdraw at any time)</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">5. Data Sharing and Disclosure</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>We do not sell your personal information. We may share your data with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Veterinary Services:</strong> In case of medical emergencies</li>
                  <li><strong>Payment Processors:</strong> Stripe for secure payment processing</li>
                  <li><strong>Service Providers:</strong> Trusted third parties who help us operate our business (e.g., email services, hosting providers)</li>
                  <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                </ul>
                <p className="mt-3">All third parties are contractually obligated to keep your information secure and confidential.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">6. Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your personal information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Secure encrypted connections (SSL/TLS)</li>
                <li>Password-protected user accounts</li>
                <li>Secure database storage with Supabase</li>
                <li>Regular security audits and updates</li>
                <li>Staff training on data protection</li>
                <li>Access controls limiting who can view your data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">7. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Active Accounts:</strong> While you remain a customer and for 12 months after your last booking</li>
                <li><strong>Financial Records:</strong> 7 years (as required by UK tax law)</li>
                <li><strong>Health Records:</strong> 3 years after last attendance</li>
                <li><strong>Marketing Consent:</strong> Until you withdraw consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">8. Your Rights</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-3">Under UK GDPR, you have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Rectification:</strong> Correct inaccurate or incomplete information</li>
                  <li><strong>Erasure:</strong> Request deletion of your data (subject to legal requirements)</li>
                  <li><strong>Restriction:</strong> Limit how we process your data</li>
                  <li><strong>Portability:</strong> Receive your data in a portable format</li>
                  <li><strong>Object:</strong> Object to processing based on legitimate interests</li>
                  <li><strong>Withdraw Consent:</strong> Withdraw consent for marketing or photography at any time</li>
                  <li><strong>Complain:</strong> Lodge a complaint with the Information Commissioner's Office (ICO)</li>
                </ul>
                <p className="mt-4">To exercise any of these rights, contact us at <a href="mailto:wecare@canineparadise.com" className="text-canine-gold hover:text-canine-light-gold">wecare@canineparadise.com</a></p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">9. Cookies and Analytics</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our website uses cookies to improve your experience and analyze site usage. Cookies are small text files stored on your device. You can control cookies through your browser settings, though some features may not work if cookies are disabled.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">10. Photography and Media</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may take photos and videos of your dog during daycare for social media, marketing, and daily updates. If you do not wish your dog to be photographed or featured in marketing materials, please notify us in writing. You can withdraw this consent at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">11. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our services are intended for adults (18+). We do not knowingly collect personal information from children under 18.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">12. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. Changes will be posted on our website with an updated "Last Updated" date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">13. Contact Us</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-3">If you have questions about this Privacy Policy or how we handle your data, please contact us:</p>
                <div className="bg-canine-cream p-4 rounded-lg">
                  <p><strong>Email:</strong> <a href="mailto:wecare@canineparadise.com" className="text-canine-gold hover:text-canine-light-gold">wecare@canineparadise.com</a></p>
                  <p><strong>Business Name:</strong> Canine Paradise</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">14. Complaints</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you're not satisfied with how we handle your data, you have the right to lodge a complaint with the UK Information Commissioner's Office (ICO):
              </p>
              <div className="bg-canine-cream p-4 rounded-lg text-gray-700">
                <p><strong>Website:</strong> <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-canine-gold hover:text-canine-light-gold">ico.org.uk</a></p>
                <p><strong>Helpline:</strong> 0303 123 1113</p>
              </div>
            </section>

            <div className="mt-12 p-6 bg-canine-sky rounded-lg border-l-4 border-canine-gold">
              <p className="text-canine-navy font-semibold mb-2">
                Your privacy matters to us.
              </p>
              <p className="text-gray-700 text-sm">
                We are committed to protecting your personal information and respecting your rights under UK GDPR and data protection laws.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
