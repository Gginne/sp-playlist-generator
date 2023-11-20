import React from 'react';

const Spinner = () => {
  return (
    <div className="flex justify-center items-center my-6">
      <div className="border-4 border-gray-200 rounded-full border-t-4 border-t-gray-500 h-12 w-12 animate-spin"></div>
    </div>
  );
};

export default Spinner;
