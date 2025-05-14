'use client';

import { useState } from 'react';

interface FavorabilityButtonProps {
  label: string;
  rating: number; // 0-10
  explanation?: string;
  isLoading?: boolean;
}

export default function FavorabilityButton({
  label,
  rating,
  explanation,
  isLoading = false
}: FavorabilityButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Determine color based on rating
  const getButtonColor = () => {
    if (isLoading) return 'bg-stardust-silver bg-opacity-20';
    if (rating >= 8) return 'bg-emerald-500'; // Excellent
    if (rating >= 6) return 'bg-green-600'; // Good
    if (rating >= 4) return 'bg-yellow-600'; // Neutral
    if (rating >= 2) return 'bg-orange-600'; // Challenging
    return 'bg-red-600'; // Difficult
  };

  // Format rating for display (add a + for high ratings)
  const formatRating = () => {
    if (isLoading) return '';
    if (rating >= 9) return '10';
    if (rating >= 8) return '8+';
    if (rating >= 6) return '6+';
    if (rating >= 4) return '4+';
    if (rating >= 2) return '2+';
    return '1';
  };

  return (
    <div className="relative">
      <button
        className={`w-full py-2 px-3 rounded-lg text-starlight-white font-medium flex justify-between items-center ${getButtonColor()} hover:opacity-90 transition-opacity`}
        onMouseEnter={() => explanation && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => explanation && setShowTooltip(!showTooltip)}
      >
        <span>{label}</span>
        {!isLoading && (
          <span className="ml-2 px-1.5 py-0.5 bg-opacity-20 bg-white rounded text-xs">
            {formatRating()}
          </span>
        )}
      </button>

      {/* Tooltip/Popover */}
      {showTooltip && explanation && (
        <div className="absolute z-10 bottom-full left-0 mb-2 w-64 bg-cosmic-ink border border-stardust-silver border-opacity-20 rounded-lg p-3 shadow-lg">
          <div className="text-sm text-starlight-white">
            <p className="font-medium mb-1">{label}: {formatRating()}/10</p>
            <p className="text-stardust-silver">{explanation}</p>
          </div>
          {/* Arrow */}
          <div className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-cosmic-ink border-b border-r border-stardust-silver border-opacity-20"></div>
        </div>
      )}

      {/* Loading State Animation */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-stardust-silver border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}