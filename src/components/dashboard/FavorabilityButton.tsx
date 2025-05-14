'use client';

import { useState } from 'react';

type FavorabilityButtonProps = {
  label: string;
  rating: number;
  explanation?: string;
  isLoading?: boolean;
};

export default function FavorabilityButton({
  label,
  rating,
  explanation,
  isLoading = false,
}: FavorabilityButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get color based on rating
  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 1:
        return 'bg-red-600';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-green-500';
      case 5:
        return 'bg-supernova-teal';
      default:
        return 'bg-stardust-silver';
    }
  };

  const handleClick = () => {
    if (explanation) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading || !explanation}
        className={`flex flex-col items-center p-3 rounded-lg bg-nebula-veil hover:bg-opacity-80 transition-colors ${
          !explanation ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
        } ${isLoading ? 'animate-pulse' : ''}`}
      >
        {isLoading ? (
          <>
            <div className="h-4 bg-dark-space rounded w-3/4 mb-3"></div>
            <div className="flex space-x-1 mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-4 h-4 bg-dark-space rounded-full"></div>
              ))}
            </div>
          </>
        ) : (
          <>
            <span className="text-sm mb-2">{label}</span>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i <= rating ? getRatingColor(rating) : 'bg-dark-space'
                  }`}
                ></div>
              ))}
            </div>
          </>
        )}
      </button>

      {/* Explanation Modal */}
      {isModalOpen && explanation && (
        <div className="fixed inset-0 bg-dark-space bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-nebula-veil rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-4 border-b border-stardust-silver border-opacity-20 flex justify-between items-center">
              <h3 className="text-xl font-bold">{label} Favorability</h3>
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
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-full ${
                        i <= rating ? getRatingColor(rating) : 'bg-dark-space'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
              <div className="text-starlight-white">
                {explanation.split('\n').map((paragraph, index) => (
                  <p key={index} className={index > 0 ? 'mt-4' : ''}>
                    {paragraph}
                  </p>
                ))}
              </div>
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