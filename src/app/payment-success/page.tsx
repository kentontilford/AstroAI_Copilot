import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@clerk/nextjs';

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const { userId } = auth();
  
  // If not authenticated, redirect to login
  if (!userId) {
    redirect('/login');
  }
  
  // Get the session ID from the URL
  const sessionId = searchParams.session_id;
  
  return (
    <div className="min-h-screen bg-dark-space py-12">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="bg-nebula-veil rounded-lg shadow-lg p-8 border border-stardust-silver border-opacity-20">
          <div className="w-20 h-20 bg-success-green bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-success-green"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold mb-4 text-starlight-white">Payment Successful!</h1>
          
          <p className="text-stardust-silver mb-6">
            Thank you for subscribing to Astrology AI Copilot Pro! Your subscription is now active, and you have full access to all premium features.
          </p>
          
          <div className="space-y-4">
            <Link
              href="/dashboard/personal"
              className="btn-primary w-full py-3 block"
            >
              Go to Dashboard
            </Link>
            
            <Link
              href="/settings"
              className="btn-secondary w-full py-3 block"
            >
              Manage Subscription
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}