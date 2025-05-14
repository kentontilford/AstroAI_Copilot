'use client';

import { useState } from 'react';

interface InsightCardProps {
  title: string;
  summary: string;
  iconName: string;
  fullInterpretation?: string;
  isLoading?: boolean;
}

export default function InsightCard({
  title,
  summary,
  iconName,
  fullInterpretation,
  isLoading = false
}: InsightCardProps) {
  const [showModal, setShowModal] = useState(false);

  const getIcon = () => {
    switch (iconName) {
      case 'star':
        return (
          <svg className="w-6 h-6 text-supernova-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'planet':
        return (
          <svg className="w-6 h-6 text-supernova-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
            <circle cx="12" cy="12" r="4" strokeWidth={2} />
          </svg>
        );
      case 'transit':
        return (
          <svg className="w-6 h-6 text-supernova-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'synergy':
        return (
          <svg className="w-6 h-6 text-supernova-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'relationship':
        return (
          <svg className="w-6 h-6 text-supernova-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-supernova-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <>
      <div className="card">
        {isLoading ? (
          <>
            <div className="flex justify-between items-start">
              <div className="h-6 w-2/3 bg-stardust-silver bg-opacity-20 rounded animate-pulse"></div>
              <div className="w-6 h-6 bg-stardust-silver bg-opacity-20 rounded animate-pulse"></div>
            </div>
            <div className="h-20 bg-stardust-silver bg-opacity-20 rounded mt-4 animate-pulse"></div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium">{title}</h3>
              {getIcon()}
            </div>
            <p className="text-stardust-silver mt-2">{summary}</p>
            {fullInterpretation && (
              <button
                onClick={() => setShowModal(true)}
                className="text-supernova-teal hover:text-opacity-80 text-sm mt-4"
              >
                View Full Interpretation
              </button>
            )}
          </>
        )}
      </div>

      {/* Modal for full interpretation */}
      {showModal && fullInterpretation && (
        <div className="fixed inset-0 bg-cosmic-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-cosmic-ink rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{title}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-stardust-silver hover:text-starlight-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-stardust-silver whitespace-pre-line">
              {fullInterpretation}
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 px-4 py-2 bg-supernova-teal text-starlight-white rounded hover:bg-opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}