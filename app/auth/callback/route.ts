import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code)

    // Get the user to check role
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Get user profile to check if setup is complete
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Check if they have dogs registered
      const { data: dogs } = await supabase
        .from('dogs')
        .select('id')
        .eq('owner_id', user.id)

      // Redirect based on setup status
      if (!dogs || dogs.length === 0) {
        // New user - needs to add a dog
        return NextResponse.redirect(`${requestUrl.origin}/dashboard?setup=true`)
      } else {
        // Existing user - go to dashboard
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      }
    }
  }

  // Return to login if no code
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}