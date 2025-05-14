import { NextRequest, NextResponse } from "next/server";
import { Stripe } from "stripe";
import stripe from "@/lib/stripe/client";
import { PrismaClient } from "@prisma/client";
import { headers } from "next/headers";

const prisma = new PrismaClient();

/**
 * Stripe webhook handler
 * 
 * Events handled:
 * - checkout.session.completed: When a checkout is successful
 * - customer.subscription.updated: When a subscription is updated
 * - customer.subscription.deleted: When a subscription is cancelled
 * - invoice.payment_failed: When a payment fails
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  // Verify webhook signature
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse("Webhook signature missing", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed`, err);
    return new NextResponse(`Webhook signature verification failed`, { status: 400 });
  }

  try {
    // Handle different event types
    switch (event.type) {
      // Checkout completed successfully
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Skip if the session is not for a subscription
        if (session.mode !== 'subscription') return new NextResponse('Session not for subscription', { status: 400 });
        
        // Get the customer ID from the session
        const customerId = session.customer as string;
        if (!customerId) return new NextResponse('Customer ID not found in session', { status: 400 });
        
        // Get the subscription ID from the session
        const subscriptionId = session.subscription as string;
        if (!subscriptionId) return new NextResponse('Subscription ID not found in session', { status: 400 });
        
        // Get client_reference_id (stored as user_clerk_id)
        const userClerkId = session.client_reference_id;
        if (!userClerkId) return new NextResponse('User Clerk ID not found in session', { status: 400 });
        
        // Get the subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        // Get the subscription end date
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        
        // Update the user record with subscription details
        await prisma.user.update({
          where: { clerk_user_id: userClerkId },
          data: {
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: "active",
            current_subscription_period_end: currentPeriodEnd,
          },
        });
        
        break;
      }
      
      // Subscription updated
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find the user with this subscription
        const user = await prisma.user.findFirst({
          where: { stripe_subscription_id: subscription.id },
        });
        
        if (!user) {
          console.error(`No user found with subscription ID: ${subscription.id}`);
          return new NextResponse(`No user found with subscription ID: ${subscription.id}`, { status: 404 });
        }
        
        // Determine the new subscription status
        let subscriptionStatus = "active";
        if (subscription.status === "canceled" || subscription.status === "unpaid") {
          subscriptionStatus = "cancelled";
        } else if (subscription.status === "past_due") {
          subscriptionStatus = "past_due";
        } else if (subscription.cancel_at_period_end) {
          // Still active but will be cancelled at the end of the period
          subscriptionStatus = "active";
        }
        
        // Update the user record
        await prisma.user.update({
          where: { clerk_user_id: user.clerk_user_id },
          data: {
            subscription_status: subscriptionStatus,
            current_subscription_period_end: new Date(subscription.current_period_end * 1000),
          },
        });
        
        break;
      }
      
      // Subscription deleted/cancelled
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find the user with this subscription
        const user = await prisma.user.findFirst({
          where: { stripe_subscription_id: subscription.id },
        });
        
        if (!user) {
          console.error(`No user found with subscription ID: ${subscription.id}`);
          return new NextResponse(`No user found with subscription ID: ${subscription.id}`, { status: 404 });
        }
        
        // Update the user record
        await prisma.user.update({
          where: { clerk_user_id: user.clerk_user_id },
          data: {
            subscription_status: "lapsed",
            current_subscription_period_end: new Date(subscription.current_period_end * 1000),
          },
        });
        
        break;
      }
      
      // Payment failed
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Only proceed if the invoice has a subscription
        if (!invoice.subscription) break;
        
        // Find the user with this subscription
        const user = await prisma.user.findFirst({
          where: { stripe_subscription_id: invoice.subscription as string },
        });
        
        if (!user) {
          console.error(`No user found with subscription ID: ${invoice.subscription}`);
          return new NextResponse(`No user found with subscription ID: ${invoice.subscription}`, { status: 404 });
        }
        
        // Update the user record to reflect payment issues
        await prisma.user.update({
          where: { clerk_user_id: user.clerk_user_id },
          data: {
            subscription_status: "past_due",
          },
        });
        
        break;
      }
    }

    // Return a successful response
    return new NextResponse(JSON.stringify({ received: true }), {
      status: 200,
    });
  } catch (error) {
    console.error(`Error processing webhook: ${event.type}`, error);
    return new NextResponse(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      status: 500,
    });
  }
}