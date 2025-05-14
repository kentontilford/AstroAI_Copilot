import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dark-space">
      {/* Header */}
      <header className="bg-nebula-veil border-b border-stardust-silver border-opacity-20 px-6 py-3">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/dashboard/personal" className="text-2xl font-bold">
            <span className="text-supernova-teal">Astrology</span> AI Copilot
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/chat" className="text-stardust-silver hover:text-starlight-white">
              Chat
            </Link>
            <Link href="/settings" className="text-stardust-silver hover:text-starlight-white">
              Settings
            </Link>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-10 h-10",
                }
              }}
              afterSignOutUrl="/"
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}