import React from 'react';

const ColorSelector = ({ colors, selectedColor, onColorSelect }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">Select Color</label>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color.id}
            onClick={() => onColorSelect(color)}
            className={`
              w-20 h-8 rounded-md border transition-all
              ${selectedColor?.id === color.id
                ? 'border-2 border-blue-500 shadow-md'
                : 'border-gray-300 hover:border-gray-400'
              }
              ${color.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={color.stock === 0}
            title={`${color.color_name} ${color.stock === 0 ? '(Out of Stock)' : ''}`}
          >
            <div className="flex items-center justify-center h-full">
              <span className="text-sm">{color.color_name}</span>
            </div>
          </button>
        ))}
      </div>
      {selectedColor && (
        <p className="text-sm text-gray-600">
          Stock: {selectedColor.stock} available
        </p>
      )}
    </div>
  );
};

export default ColorSelector;
