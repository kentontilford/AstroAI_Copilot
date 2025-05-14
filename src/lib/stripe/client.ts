import Stripe from 'stripe';
import { env } from '@/lib/env/server';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Specify the Stripe API version to use
});

export default stripe;