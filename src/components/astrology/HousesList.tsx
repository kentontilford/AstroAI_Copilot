import React from 'react';

type House = {
  house_number: number;
  sign: string;
  sign_glyph: string;
  start_degree_in_sign: number;
};

export default function HousesList({
  houses,
  title,
  onItemClick,
}: {
  houses: House[];
  title: string;
  onItemClick?: (house: House) => void;
}) {
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">{title}</h3>
      <div className="bg-dark-space border border-stardust-silver border-opacity-20 rounded-lg p-2">
        <ul className="divide-y divide-stardust-silver divide-opacity-10">
          {houses.map((house) => (
            <li
              key={house.house_number}
              onClick={() => onItemClick && onItemClick(house)}
              className={`flex items-center justify-between p-2 ${
                onItemClick ? 'cursor-pointer hover:bg-nebula-veil hover:bg-opacity-30' : ''
              }`}
            >
              <div className="flex items-center">
                <span className="font-semibold">House {house.house_number}</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg mr-1">{house.sign_glyph}</span>
                <span>{house.sign}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}