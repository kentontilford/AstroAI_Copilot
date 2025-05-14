import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-cosmic">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-supernova-teal">Astrology</span> AI Copilot
        </h1>
        <p className="text-stardust-silver">Create your account</p>
      </div>
      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: 'bg-supernova-teal hover:bg-opacity-90 text-dark-space',
            card: 'bg-nebula-veil border border-stardust-silver border-opacity-20',
            headerTitle: 'text-starlight-white',
            headerSubtitle: 'text-stardust-silver',
            formFieldLabel: 'text-stardust-silver',
            formFieldInput: 'bg-dark-space border-stardust-silver border-opacity-30 text-starlight-white',
            footerActionLink: 'text-supernova-teal hover:text-opacity-80',
            socialButtonsBlockButton: 'border-stardust-silver border-opacity-30 text-starlight-white',
            socialButtonsBlockButtonText: 'text-starlight-white',
          }
        }}
      />
    </div>
  );
}