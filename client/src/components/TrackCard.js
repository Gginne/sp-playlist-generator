import React from 'react';

export default function TrackCard({ data }) {
  const { image, song, artist } = data;

  return (
    <div className="bg-black shadow-sm m-2 p-4 rounded-lg relative">
      <div className="flex items-center">
        <img src={image} alt={`${song} cover`} className="w-16 h-16 mr-4 rounded-full" />
        <div>
          <h4 className="text-white text-lg font-semibold">{song}</h4>
          <p className="text-gray-400 text-md">{artist}</p>
        </div>
      </div>
      
    
    </div>
  );
}


