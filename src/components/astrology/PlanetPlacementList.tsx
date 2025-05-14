import React from 'react';

type PlanetPlacement = {
  name: string;
  sign: string;
  sign_glyph: string;
  degree: number;
  minute: number;
  full_degree: number;
  house?: number;
};

export default function PlanetPlacementList({
  placements,
  title,
  onItemClick,
}: {
  placements: PlanetPlacement[];
  title: string;
  onItemClick?: (placement: PlanetPlacement) => void;
}) {
  // Map planet names to their glyphs
  const planetGlyphs: Record<string, string> = {
    SUN: '☉',
    MOON: '☽',
    MERCURY: '☿',
    VENUS: '♀',
    MARS: '♂',
    JUPITER: '♃',
    SATURN: '♄',
    URANUS: '♅',
    NEPTUNE: '♆',
    PLUTO: '♇',
    CHIRON: '⚷',
    NORTH_NODE: '☊',
    ASCENDANT: 'ASC',
    MIDHEAVEN: 'MC',
  };

  // Friendly planet names
  const planetNames: Record<string, string> = {
    SUN: 'Sun',
    MOON: 'Moon',
    MERCURY: 'Mercury',
    VENUS: 'Venus',
    MARS: 'Mars',
    JUPITER: 'Jupiter',
    SATURN: 'Saturn',
    URANUS: 'Uranus',
    NEPTUNE: 'Neptune',
    PLUTO: 'Pluto',
    CHIRON: 'Chiron',
    NORTH_NODE: 'North Node',
    ASCENDANT: 'Ascendant',
    MIDHEAVEN: 'Midheaven',
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">{title}</h3>
      <div className="bg-dark-space border border-stardust-silver border-opacity-20 rounded-lg p-2">
        <ul className="divide-y divide-stardust-silver divide-opacity-10">
          {placements.map((placement) => (
            <li
              key={placement.name}
              onClick={() => onItemClick && onItemClick(placement)}
              className={`flex items-center justify-between p-2 ${
                onItemClick ? 'cursor-pointer hover:bg-nebula-veil hover:bg-opacity-30' : ''
              }`}
            >
              <div className="flex items-center">
                <span className="font-semibold mr-2">{planetGlyphs[placement.name]}</span>
                <span>{planetNames[placement.name] || placement.name}</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg mx-1">{placement.sign_glyph}</span>
                <span>
                  {placement.degree}°{placement.minute}'
                </span>
                {placement.house && (
                  <span className="ml-2 text-stardust-silver text-sm">H{placement.house}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}