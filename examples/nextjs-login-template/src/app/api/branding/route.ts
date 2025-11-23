import { NextRequest, NextResponse } from 'next/server'
import { fetchBrandingFromAPI, getBrandingFromEnv, mergeBranding } from '@/lib/branding'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('client_id') || process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID

    if (!clientId) {
      return NextResponse.json(
        { error: 'client_id is required' },
        { status: 400 }
      )
    }

    // Fetch branding from API
    const apiBranding = await fetchBrandingFromAPI(clientId)

    // Get branding from environment variables
    const envBranding = getBrandingFromEnv()

    // Merge configurations
    const branding = mergeBranding(apiBranding, envBranding)

    return NextResponse.json(branding)
  } catch (error) {
    console.error('Error in branding API route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branding' },
      { status: 500 }
    )
  }
}
