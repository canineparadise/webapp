'use client'

import { motion } from 'framer-motion'
import { StarIcon } from '@heroicons/react/24/solid'

const testimonials = [
  {
    name: 'Anthony Cloke',
    text: 'Our doggy, Poppy, has been going to Canine Paradise for several years. She regularly goes to the daycare and absolutely loves it. She doesn\'t say goodbye when we drop her off as she\'s running into the building! When she comes home she\'s always happy. Cannot recommend this place enough. Fantastic staff, lovely and hugely experienced.',
    rating: 5,
  },
  {
    name: 'Roozy 86',
    text: 'My 17 week old Mastiff had her assessment today. I was really nervous leaving her and apprehensive. I encountered 4 staff members, all were very kind and welcoming. I spoke with 2 ladies who collected and dropped my pup back to me, who were very informative and welcoming. I didn\'t feel rushed and was given a huge update after the assessment. My pup loved it and for the 1st time was able to be off the lead and around other dogs! I can\'t believe it. She will now be booked in for day care to continue this experience. Thank you all so much and Bear 🐾 can\'t wait to return!',
    rating: 5,
  },
  {
    name: 'C Glenn',
    text: 'Our puppy loves this place. In fact my poor wife was a bit disappointed that he wasn\'t super excited to see her when she picked him up after his first day. He slept so well that evening and night and was much calmer than normal next day. The team here are so cheerful and it\'s clear they love caring for the dogs. I found the place by accident driving past, but am glad I did. The pricing is very reasonable too, and if you book a monthly block in advance the discounts are helpful.',
    rating: 5,
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-canine-navy mb-4">
            Happy Tails
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it - hear from our wonderful clients!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card relative"
            >
              <div className="absolute -top-4 -right-4 text-6xl text-canine-gold/20 font-display">
                "
              </div>
              <div className="flex mb-4 justify-center">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "{testimonial.text}"
              </p>
              <div className="border-t pt-4">
                <p className="font-semibold text-canine-navy">{testimonial.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}