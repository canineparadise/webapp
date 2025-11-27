'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugSlots() {
  const [allSlots, setAllSlots] = useState<any[]>([])
  const [availableSlots, setAvailableSlots] = useState<any[]>([])

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    const today = new Date().toISOString().split('T')[0]

    // Get ALL slots
    const { data: all } = await supabase
      .from('assessment_slots')
      .select('*')
      .order('assessment_date', { ascending: true })
      .order('start_time', { ascending: true })

    setAllSlots(all || [])

    // Get available slots (what client sees)
    const { data: available } = await supabase
      .from('assessment_slots')
      .select('*')
      .gte('assessment_date', today)
      .eq('is_available', true)
      .is('booked_by_user_id', null)
      .order('assessment_date', { ascending: true })
      .order('start_time', { ascending: true })

    setAvailableSlots(available || [])
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Assessment Slots Debug</h1>
      <p className="mb-4">Today: {new Date().toISOString().split('T')[0]}</p>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-red-600">ALL SLOTS IN DATABASE ({allSlots.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Date</th>
                <th className="border p-2">Start Time</th>
                <th className="border p-2">End Time</th>
                <th className="border p-2">is_available</th>
                <th className="border p-2">booked_by_user_id</th>
                <th className="border p-2">max_dogs</th>
                <th className="border p-2">booked_count</th>
                <th className="border p-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {allSlots.map((slot, i) => (
                <tr key={i} className={slot.is_available && !slot.booked_by_user_id ? 'bg-green-50' : 'bg-red-50'}>
                  <td className="border p-2">{slot.assessment_date}</td>
                  <td className="border p-2">{slot.start_time}</td>
                  <td className="border p-2">{slot.end_time}</td>
                  <td className="border p-2">{slot.is_available ? 'TRUE' : 'FALSE'}</td>
                  <td className="border p-2">{slot.booked_by_user_id || 'NULL'}</td>
                  <td className="border p-2">{slot.max_dogs}</td>
                  <td className="border p-2">{slot.booked_count}</td>
                  <td className="border p-2">{new Date(slot.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 text-green-600">AVAILABLE SLOTS (What Client Sees) ({availableSlots.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Date</th>
                <th className="border p-2">Start Time</th>
                <th className="border p-2">End Time</th>
              </tr>
            </thead>
            <tbody>
              {availableSlots.map((slot, i) => (
                <tr key={i} className="bg-green-50">
                  <td className="border p-2">{slot.assessment_date}</td>
                  <td className="border p-2">{slot.start_time}</td>
                  <td className="border p-2">{slot.end_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-300 rounded">
        <h3 className="font-bold mb-2">Query Filters Applied:</h3>
        <ul className="list-disc pl-6">
          <li>Date &gt;= {new Date().toISOString().split('T')[0]}</li>
          <li>is_available = true</li>
          <li>booked_by_user_id IS NULL</li>
        </ul>
      </div>
    </div>
  )
}
