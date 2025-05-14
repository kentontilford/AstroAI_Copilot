'use client';

import { useState } from 'react';

type InsightCardProps = {
  title: string;
  summary: string;
  iconName?: 'star' | 'planet' | 'transit' | 'synergy' | 'relationship';
  onClick?: () => void;
  fullInterpretation?: string;
  isLoading?: boolean;
};

export default function InsightCard({
  title,
  summary,
  iconName = 'star',
  onClick,
  fullInterpretation,
  isLoading = false,
}: InsightCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Map of icon names to their SVG representations
  const icons = {
    star: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-supernova-teal"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    ),
    planet: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-supernova-teal"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="4"></circle>
        <line x1="21.17" y1="8" x2="12" y2="8"></line>
        <line x1="3.95" y1="6.06" x2="8.54" y2="14"></line>
        <line x1="10.88" y1="21.94" x2="15.46" y2="14"></line>
      </svg>
    ),
    transit: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-supernova-teal"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 6v6l4 2"></path>
      </svg>
    ),
    synergy: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-supernova-teal"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
        <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
        <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    ),
    relationship: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-supernova-teal"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    ),
  };

  // Handle card click - either call custom onClick or open modal
  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else if (fullInterpretation) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div
        className={`card h-48 flex flex-col hover:bg-opacity-80 transition-all duration-200 ${
          fullInterpretation || onClick ? 'cursor-pointer' : ''
        } ${isLoading ? 'animate-pulse' : ''}`}
        onClick={handleCardClick}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-10 h-10 bg-nebula-veil rounded-full mb-4"></div>
            <div className="h-4 bg-nebula-veil rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-nebula-veil rounded w-5/6 mb-2"></div>
            <div className="h-3 bg-nebula-veil rounded w-4/6"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center mb-3">
              <div className="p-1.5 rounded-full bg-cosmic-purple bg-opacity-30 mr-3">
                {icons[iconName]}
              </div>
              <h3 className="font-semibold text-lg">{title}</h3>
            </div>
            <p className="text-stardust-silver flex-grow">{summary}</p>
            {(fullInterpretation || onClick) && (
              <div className="text-right mt-2">
                <span className="text-supernova-teal text-sm">
                  {fullInterpretation ? 'Read More' : 'View Details'}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Full Interpretation Modal */}
      {isModalOpen && fullInterpretation && (
        <div className="fixed inset-0 bg-dark-space bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-nebula-veil rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-stardust-silver border-opacity-20 flex justify-between items-center">
              <h3 className="text-xl font-bold">{title}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stardust-silver hover:text-starlight-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow">
              {fullInterpretation.split('\n').map((paragraph, index) => (
                <p key={index} className={index > 0 ? 'mt-4' : ''}>
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="p-4 border-t border-stardust-silver border-opacity-20 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}