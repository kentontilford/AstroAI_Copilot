import { UserProfile } from "@clerk/nextjs";
import Link from "next/link";
import SubscriptionSection from "@/components/settings/SubscriptionSection";
import { auth, currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function SettingsPage() {
  // Get the authenticated user
  const { userId } = auth();
  if (!userId) {
    redirect('/login');
  }
  
  // Get Clerk user
  const user = await currentUser();
  if (!user) {
    redirect('/login');
  }
  
  // Get user data from database
  const dbUser = await prisma.user.findUnique({
    where: { clerk_user_id: userId },
  });
  
  return (
    <div className="min-h-screen bg-dark-space py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <div className="space-y-8">
          {/* Account Settings */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            <UserProfile 
              appearance={{
                elements: {
                  rootBox: "bg-transparent shadow-none p-0",
                  card: "bg-transparent shadow-none",
                  navbar: "hidden",
                  pageScrollBox: "overflow-visible p-0",
                  formButtonPrimary: "bg-supernova-teal hover:bg-opacity-90 text-dark-space",
                  formFieldInput: "bg-dark-space border-stardust-silver border-opacity-30 text-starlight-white",
                  formFieldLabel: "text-stardust-silver",
                }
              }}
            />
          </div>

          {/* Subscription Management */}
          {dbUser && (
            <SubscriptionSection 
              status={dbUser.subscription_status}
              trialEndsAt={dbUser.trial_ends_at}
              currentPeriodEnd={dbUser.current_subscription_period_end}
            />
          )}

          {/* Birth Profile Management Placeholder */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Birth Profile Vault</h2>
            <p className="text-stardust-silver mb-4">Create and manage your birth profiles.</p>
            
            <button className="btn-primary mb-8">
              Add New Profile
            </button>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-3">Your Profiles</h3>
              <div className="bg-dark-space border border-stardust-silver border-opacity-20 rounded-lg p-6 flex items-center justify-center">
                <p className="text-stardust-silver">No profiles created yet.</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Default Relationship Pair</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-stardust-silver mb-2">Profile A</label>
                  <select disabled className="input-field w-full bg-opacity-50 cursor-not-allowed">
                    <option>No profiles available</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stardust-silver mb-2">Profile B</label>
                  <select disabled className="input-field w-full bg-opacity-50 cursor-not-allowed">
                    <option>No profiles available</option>
                  </select>
                </div>
              </div>
              <button disabled className="btn-secondary opacity-50 cursor-not-allowed">
                Save Pair
              </button>
            </div>
          </div>

          {/* Legal Links */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Legal</h2>
            <div className="space-x-6">
              <Link href="#" className="text-supernova-teal hover:underline">
                Terms of Service
              </Link>
              <Link href="#" className="text-supernova-teal hover:underline">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}