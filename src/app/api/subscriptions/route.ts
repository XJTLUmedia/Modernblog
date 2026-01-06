import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

// GET /api/subscriptions - Get all subscriptions or user's subscription
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    // If email provided, get specific user's subscription
    if (email) {
      const subscription = await db.subscription.findUnique({
        where: { email }
      })

      if (!subscription) {
        return NextResponse.json(
          { error: 'Subscription not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(subscription)
    }

    // Otherwise, get all subscriptions (for admin)
    const subscriptions = await db.subscription.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error('Get subscriptions error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscriptions' },
      { status: 500 }
    )
  }
}

// POST /api/subscriptions - Create new subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, categories, frequency } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already subscribed
    const existingSubscription = await db.subscription.findFirst({
      where: {
        email,
        isActive: true
      }
    })

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Email is already subscribed' },
        { status: 409 }
      )
    }

    // Create subscription
    const subscription = await db.subscription.create({
      data: {
        email,
        userId: user.id,
        frequency: frequency || 'immediate',
        categories: categories || [],
        isActive: true
      }
    })

    // Send welcome email
    await sendEmail({
      to: email,
      subject: 'Welcome to our newsletter!',
      content: `
        <h1>Thanks for subscribing!</h1>
        <p>You'll now receive updates about new ${categories?.join(', ') || 'content'}.</p>
        <p>Frequency: ${frequency}</p>
      `
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to new posts',
      subscription
    }, { status: 201 })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

// DELETE /api/subscriptions - Unsubscribe or delete subscription
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const subscription = await db.subscription.findFirst({
      where: {
        email,
        isActive: true
      }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Active subscription not found' },
        { status: 404 }
      )
    }

    // Mark as inactive instead of deleting
    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        isActive: false,
        unsubscribedAt: new Date()
      }
    })

    // Send confirmation email
    await sendEmail({
      to: email,
      subject: 'Unsubscribed from newsletter',
      content: `
        <h1>We're sorry to see you go</h1>
        <p>You have been successfully unsubscribed from our updates.</p>
        <p>You can resubscribe anytime by visiting our site.</p>
      `
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed'
    })
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    )
  }
}
