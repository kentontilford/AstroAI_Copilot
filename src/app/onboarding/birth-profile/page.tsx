export default function BirthProfileOnboardingPage() {
  return (
    <div className="min-h-screen bg-dark-space flex items-center justify-center py-12">
      <div className="max-w-xl w-full mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-supernova-teal">Welcome</span> to Astrology AI Copilot
          </h1>
          <p className="text-xl text-stardust-silver">
            Let's set up your birth profile to create your personalized experience
          </p>
        </div>
        
        <div className="card p-6">
          <form>
            <div className="mb-6">
              <label htmlFor="profileName" className="block text-stardust-silver mb-2">
                Profile Name
              </label>
              <input
                type="text"
                id="profileName"
                placeholder="My Chart"
                className="input-field w-full"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="dateOfBirth" className="block text-stardust-silver mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                id="dateOfBirth"
                className="input-field w-full"
              />
            </div>
            
            <div className="mb-2">
              <label htmlFor="timeOfBirth" className="block text-stardust-silver mb-2">
                Time of Birth
              </label>
              <input
                type="time"
                id="timeOfBirth"
                className="input-field w-full"
              />
            </div>
            
            <div className="mb-6">
              <label className="flex items-center text-stardust-silver">
                <input
                  type="checkbox"
                  className="mr-2 h-4 w-4"
                />
                I don't know my exact birth time
              </label>
            </div>
            
            <div className="mb-8">
              <label htmlFor="birthPlace" className="block text-stardust-silver mb-2">
                Birth Place
              </label>
              <input
                type="text"
                id="birthPlace"
                placeholder="Search for a city..."
                className="input-field w-full"
              />
              <p className="text-sm text-stardust-silver mt-1">
                We'll use this to determine your geographical coordinates and timezone
              </p>
            </div>
            
            <button
              type="submit"
              className="btn-primary w-full py-3 text-lg"
            >
              Save & Continue to Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}