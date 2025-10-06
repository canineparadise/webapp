'use client'

import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function TermsAndConditions() {
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
            Terms and Conditions
          </h1>
          <p className="text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to Canine Paradise. These Terms and Conditions govern your use of our doggy daycare services and website. By using our services, you agree to these terms in full.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">2. Service Description</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Canine Paradise provides professional doggy daycare services, including full-day care (7am-7pm) and half-day care (10am-2pm). Our services include supervised play, socialization, enrichment activities, and professional care by certified handlers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">3. Bookings and Subscriptions</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p><strong>3.1 Booking:</strong> All bookings must be made through our online platform or by contacting us directly.</p>
                <p><strong>3.2 Subscriptions:</strong> Monthly subscription packages are available with various day allocations (4, 8, 12, 16, or 20 days per month).</p>
                <p><strong>3.3 Session Types:</strong> You may choose between full-day (7am-7pm) or half-day (10am-2pm) sessions at the time of booking.</p>
                <p><strong>3.4 Payment:</strong> Payment is required at the time of booking or subscription activation via our secure payment system.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">4. Cancellation Policy</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p><strong>4.1 Notice Period:</strong> Customers must provide <strong>30 days written notice</strong> to cancel their subscription. Notice must be submitted through your account dashboard or by email to wecare@canineparadise.com.</p>
                <p><strong>4.2 Cancellation Charges:</strong> If less than 30 days notice is provided, you will be charged for one additional month at your current subscription rate.</p>
                <p><strong>4.3 Effective Date:</strong> Cancellations become effective 30 days from the date of your cancellation request.</p>
                <p><strong>4.4 Individual Bookings:</strong> Individual booking cancellations must be made at least 24 hours in advance for a full refund. Cancellations made less than 24 hours before the booking will not be refunded.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">5. Dog Requirements</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p><strong>5.1 Vaccinations:</strong> All dogs must be up-to-date with vaccinations including DHPP, Rabies, and Bordetella. Proof of vaccination must be provided before first attendance.</p>
                <p><strong>5.2 Health:</strong> Dogs must be in good health and free from contagious illnesses. We reserve the right to refuse service to any dog showing signs of illness.</p>
                <p><strong>5.3 Behavior:</strong> Dogs must be non-aggressive and socialized with other dogs. An initial assessment may be required.</p>
                <p><strong>5.4 Flea/Tick Treatment:</strong> Dogs must be on regular flea and tick prevention programs.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">6. Liability and Insurance</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                While we take every precaution to ensure the safety of your dog, you acknowledge that doggy daycare involves inherent risks. Canine Paradise carries comprehensive liability insurance, but owners are responsible for any injuries their dog may cause to other dogs or staff. We are not liable for pre-existing conditions or injuries that occur despite reasonable care.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">7. Emergency Veterinary Care</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                In the event of a medical emergency, we will make every effort to contact you immediately. If we cannot reach you, we are authorized to seek veterinary care on your behalf. You agree to be responsible for all veterinary costs incurred.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">8. Drop-off and Pick-up</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p><strong>8.1 Hours:</strong> Full-day care is available from 7am-7pm. Half-day care is from 10am-2pm.</p>
                <p><strong>8.2 Late Pick-up:</strong> A late pick-up fee of £10 per 15 minutes will be charged for collections after closing time.</p>
                <p><strong>8.3 Authorization:</strong> Only authorized individuals listed on your account may collect your dog. Photo ID may be requested.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">9. Personal Belongings</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                While we take care of any items you bring (collars, leads, toys), we are not responsible for lost, stolen, or damaged personal belongings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">10. Photography and Media</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By using our services, you consent to Canine Paradise photographing your dog and using these images for marketing purposes including social media, website, and promotional materials. If you do not wish your dog to be photographed, please notify us in writing.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right to modify these Terms and Conditions at any time. Changes will be posted on our website and become effective immediately. Continued use of our services constitutes acceptance of modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-canine-navy mb-4">12. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                For questions about these Terms and Conditions, please contact us at:<br />
                <strong>Email:</strong> <a href="mailto:wecare@canineparadise.com" className="text-canine-gold hover:text-canine-light-gold">wecare@canineparadise.com</a>
              </p>
            </section>

            <div className="mt-12 p-6 bg-canine-sky rounded-lg border-l-4 border-canine-gold">
              <p className="text-canine-navy font-semibold mb-2">
                By using Canine Paradise services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
              <p className="text-gray-700 text-sm">
                These terms form a legally binding agreement between you and Canine Paradise.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
