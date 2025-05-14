'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SubscribePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Function to handle subscription checkout
  const handleSubscribe = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call our API to create a Stripe Checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start checkout');
      }

      // Get the checkout URL
      const data = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      console.error('Error starting checkout:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-space py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2 text-center">Unlock Full Access</h1>
        <p className="text-xl text-stardust-silver mb-12 text-center">
          Get unlimited access to premium features with Astrology AI Copilot Pro
        </p>
        
        <div className="card max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-supernova-teal mb-2">Astrology AI Copilot Pro</h2>
            <p className="text-3xl font-bold mb-2">$9.99<span className="text-stardust-silver text-lg font-normal">/month</span></p>
            <p className="text-stardust-silver">Billed monthly. Cancel anytime.</p>
          </div>
          
          <div className="mb-8">
            <h3 className="font-medium mb-4 text-lg">Everything you need for cosmic guidance:</h3>
            <ul className="space-y-3">
              {[
                "Personalized Birth Chart Insights",
                "Daily Transit Opportunities",
                "Advanced Relationship Compatibility",
                "AI-Powered Chart Interpretations",
                "Unlimited AI Copilot Chat Access",
                "Save Multiple Birth Profiles"
              ].map((feature) => (
                <li key={feature} className="flex items-center">
                  <span className="text-supernova-teal mr-2">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {error && (
            <div className="bg-red-900 bg-opacity-20 border border-red-500 border-opacity-40 p-3 rounded-md text-red-300 mb-4">
              {error}
            </div>
          )}
          
          <button 
            className={`btn-primary w-full py-3 text-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={handleSubscribe}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Proceed to Secure Payment'
            )}
          </button>
          
          <p className="text-stardust-silver text-sm mt-4 text-center">
            By subscribing, you agree to our <Link href="#" className="text-supernova-teal hover:underline">Terms of Service</Link> and <Link href="#" className="text-supernova-teal hover:underline">Privacy Policy</Link>.
          </p>
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/dashboard/personal" className="text-supernova-teal hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}