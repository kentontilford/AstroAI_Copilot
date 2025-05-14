import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-cosmic">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-sans text-sm flex flex-col">
        <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center tracking-tight">
          <span className="text-supernova-teal">Astrology</span> AI Copilot
        </h1>
        <p className="text-xl md:text-2xl mb-12 text-center max-w-2xl">
          Your AI-powered astrological guide, seamlessly integrating ancient wisdom with modern technology.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/signup" className="btn-primary text-center px-8 py-3 text-lg">
            Sign Up
          </Link>
          <Link href="/login" className="btn-secondary text-center px-8 py-3 text-lg">
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}