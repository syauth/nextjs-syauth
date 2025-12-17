import { NextRequest, NextResponse } from 'next/server'
import { fetchBrandingFromAPI, getBrandingFromEnv, mergeBranding } from '@/lib/branding'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('client_id') || process.env.NEXT_PUBLIC_SYAUTH_CLIENT_ID

    if (!clientId) {
      return NextResponse.json(
        { error: 'client_id is required' },
        { status: 400 }
      )
    }

    // Fetch branding from API
    let apiBranding = null
    try {
      const apiUrl = process.env.NEXT_PUBLIC_SYAUTH_API_URL
      if (apiUrl) {
        const brandingResponse = await fetch(
          `${apiUrl}/oauth/clients/${clientId}/branding/`,
          {
            // Server-side fetch, no CORS issues
            headers: {
              'Accept': 'application/json',
            },
          }
        )
        if (brandingResponse.ok) {
          apiBranding = await brandingResponse.json()
        }
      }
    } catch (error) {
      console.error('Failed to fetch branding from API:', error)
      // Continue with env branding
    }

    // Get branding from environment variables
    const envBranding = getBrandingFromEnv()

    // Merge configurations (API takes precedence)
    const branding = mergeBranding(apiBranding, envBranding)

    // Fetch external providers from backend API
    let externalProviders = []
    try {
      const apiUrl = process.env.NEXT_PUBLIC_SYAUTH_API_URL
      if (apiUrl) {
        const providersResponse = await fetch(
          `${apiUrl}/oauth/clients/${clientId}/providers/`,
          {
            // Server-side fetch, no CORS issues
            headers: {
              'Accept': 'application/json',
            },
          }
        )
        if (providersResponse.ok) {
          externalProviders = await providersResponse.json()
        }
      }
    } catch (error) {
      console.error('Failed to fetch external providers:', error)
      // Continue without external providers
    }

    return NextResponse.json({
      branding,
      externalProviders,
    })
  } catch (error) {
    console.error('Error in branding API route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branding' },
      { status: 500 }
    )
  }
}
