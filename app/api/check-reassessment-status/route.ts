import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Check if a dog needs reassessment based on 30-day inactivity rule
// Excludes dogs with paused subscriptions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dogId = searchParams.get('dogId')
    const userId = searchParams.get('userId')

    if (!dogId && !userId) {
      return NextResponse.json(
        { error: 'dogId or userId is required' },
        { status: 400 }
      )
    }

    // Build query to get dogs
    let query = supabase
      .from('dogs')
      .select(`
        id,
        name,
        is_approved,
        last_activity_date,
        requires_reassessment,
        reassessment_required_at,
        reassessment_reason,
        owner_id
      `)

    if (dogId) {
      query = query.eq('id', dogId)
    } else if (userId) {
      query = query.eq('owner_id', userId)
    }

    const { data: dogs, error: dogsError } = await query

    if (dogsError) {
      console.error('Error fetching dogs:', dogsError)
      return NextResponse.json({ error: 'Failed to fetch dogs' }, { status: 500 })
    }

    if (!dogs || dogs.length === 0) {
      return NextResponse.json({ dogs: [], needsReassessment: false })
    }

    // Check each dog's reassessment status
    const dogsWithStatus = await Promise.all(
      dogs.map(async (dog) => {
        // Check if owner has a paused subscription
        const { data: pausedSub } = await supabase
          .from('subscriptions')
          .select('id, is_paused, pause_start_date, pause_end_date')
          .eq('user_id', dog.owner_id)
          .eq('is_paused', true)
          .eq('is_active', true)
          .maybeSingle()

        const hasPausedSubscription = !!pausedSub

        // Calculate days since last activity
        let daysSinceLastActivity = null
        if (dog.last_activity_date) {
          const lastActivity = new Date(dog.last_activity_date)
          const now = new Date()
          daysSinceLastActivity = Math.floor(
            (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
          )
        }

        // Determine if reassessment is needed
        // - Not needed if subscription is paused
        // - Not needed if dog is not approved (needs initial assessment)
        // - Needed if 30+ days since last activity
        let needsReassessment = dog.requires_reassessment
        let reason = dog.reassessment_reason

        if (!hasPausedSubscription && dog.is_approved) {
          if (daysSinceLastActivity !== null && daysSinceLastActivity >= 30) {
            needsReassessment = true
            reason = reason || '30+ days without visiting daycare'

            // Update the dog record if not already flagged
            if (!dog.requires_reassessment) {
              await supabase
                .from('dogs')
                .update({
                  requires_reassessment: true,
                  reassessment_required_at: new Date().toISOString(),
                  reassessment_reason: reason
                })
                .eq('id', dog.id)
            }
          }
        } else if (hasPausedSubscription && dog.requires_reassessment) {
          // Clear reassessment flag if subscription is now paused
          // (They paused before becoming inactive, so don't penalize them)
          needsReassessment = false
          reason = null
        }

        return {
          ...dog,
          requires_reassessment: needsReassessment,
          reassessment_reason: reason,
          days_since_last_activity: daysSinceLastActivity,
          has_paused_subscription: hasPausedSubscription,
          paused_subscription: pausedSub
        }
      })
    )

    const anyNeedsReassessment = dogsWithStatus.some(d => d.requires_reassessment)

    return NextResponse.json({
      dogs: dogsWithStatus,
      needsReassessment: anyNeedsReassessment
    })
  } catch (error: any) {
    console.error('Error checking reassessment status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check reassessment status' },
      { status: 500 }
    )
  }
}

// POST: Mark inactive dogs for reassessment (admin/cron job use)
export async function POST(request: NextRequest) {
  try {
    // This could be called by a cron job or admin action
    // to mark all inactive dogs as needing reassessment

    // Get all approved dogs
    const { data: dogs, error: dogsError } = await supabase
      .from('dogs')
      .select(`
        id,
        name,
        owner_id,
        is_approved,
        last_activity_date,
        requires_reassessment
      `)
      .eq('is_approved', true)
      .eq('requires_reassessment', false)

    if (dogsError) throw dogsError

    let markedCount = 0

    for (const dog of dogs || []) {
      // Check if owner has a paused subscription
      const { data: pausedSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', dog.owner_id)
        .eq('is_paused', true)
        .eq('is_active', true)
        .maybeSingle()

      if (pausedSub) continue // Skip dogs with paused subscriptions

      // Calculate days since last activity
      if (!dog.last_activity_date) continue

      const lastActivity = new Date(dog.last_activity_date)
      const now = new Date()
      const daysSinceLastActivity = Math.floor(
        (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysSinceLastActivity >= 30) {
        await supabase
          .from('dogs')
          .update({
            requires_reassessment: true,
            reassessment_required_at: new Date().toISOString(),
            reassessment_reason: '30+ days without visiting daycare'
          })
          .eq('id', dog.id)

        markedCount++
      }
    }

    return NextResponse.json({
      success: true,
      markedCount,
      message: `Marked ${markedCount} dogs as requiring reassessment`
    })
  } catch (error: any) {
    console.error('Error marking dogs for reassessment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to mark dogs for reassessment' },
      { status: 500 }
    )
  }
}
