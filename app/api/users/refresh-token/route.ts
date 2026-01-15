import { NextRequest, NextResponse } from 'next/server'
import { BASE_URL } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    // Get the refresh token from cookies or request body
    const body = await request.json()
    const refreshToken = body.refreshToken

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      )
    }

    // Call the external API to refresh the token
    const response = await fetch(`${BASE_URL}/users/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error || 'Failed to refresh token' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Refresh token error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}