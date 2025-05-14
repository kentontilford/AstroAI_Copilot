'use client';

import { useState } from 'react';
import Link from 'next/link';

type SubscriptionProps = {
  status: string;
  trialEndsAt?: Date | null;
  currentPeriodEnd?: Date | null;
};

export default function SubscriptionSection({
  status,
  trialEndsAt,
  currentPeriodEnd,
}: SubscriptionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format a date to display
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  // Check if trial is active
  const isTrialActive = status === 'trialing' && trialEndsAt && new Date(trialEndsAt) > new Date();

  // Calculate days left in trial
  const getDaysLeft = (endDate: Date) => {
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Handle opening Stripe customer portal
  const handleManageSubscription = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to open customer portal');
      }

      const data = await response.json();
      
      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (err) {
      console.error('Error opening customer portal:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Subscription</h2>
      
      {error && (
        <div className="bg-red-900 bg-opacity-20 border border-red-500 border-opacity-40 p-3 rounded-md text-red-300 mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-stardust-silver mb-2">Current Status</h3>
        <div className="flex items-center">
          {status === 'active' && (
            <span className="flex items-center text-success-green font-medium">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Active Subscription
            </span>
          )}
          
          {isTrialActive && trialEndsAt && (
            <span className="flex items-center text-supernova-teal font-medium">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Trial Active ({getDaysLeft(new Date(trialEndsAt))} days left)
            </span>
          )}
          
          {status === 'trialing' && trialEndsAt && new Date(trialEndsAt) <= new Date() && (
            <span className="flex items-center text-error-red font-medium">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Trial Ended
            </span>
          )}
          
          {(status === 'cancelled' || status === 'lapsed') && (
            <span className="flex items-center text-error-red font-medium">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              {status === 'cancelled' ? 'Subscription Cancelled' : 'Subscription Lapsed'}
            </span>
          )}
          
          {status === 'past_due' && (
            <span className="flex items-center text-error-red font-medium">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Payment Failed
            </span>
          )}
        </div>
      </div>
      
      {status === 'active' && currentPeriodEnd && (
        <div className="mb-6">
          <h3 className="text-stardust-silver mb-2">Next Billing Date</h3>
          <p>{formatDate(currentPeriodEnd)}</p>
        </div>
      )}
      
      <div className="flex gap-4">
        {status === 'active' && (
          <button
            onClick={handleManageSubscription}
            disabled={isLoading}
            className={`btn-primary ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Loading...' : 'Manage Subscription'}
          </button>
        )}
        
        {(status === 'trialing' && trialEndsAt && new Date(trialEndsAt) <= new Date()) || 
         status === 'lapsed' || 
         status === 'cancelled' || 
         status === 'free_tier_post_trial' ? (
          <Link href="/subscribe" className="btn-primary">
            Subscribe Now
          </Link>
        ) : null}
        
        {isTrialActive && (
          <Link href="/subscribe" className="btn-primary">
            Upgrade to Pro
          </Link>
        )}
      </div>
    </div>
  );
}