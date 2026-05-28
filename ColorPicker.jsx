import React, { useRef } from 'react';
import { Check, Palette } from 'lucide-react';
import { COLOR_PRESETS, getContrastColor } from '@/lib/stopwatchUtils';

export default function ColorPicker({ value, onChange }) {
  const inputRef = useRef(null);
  const isCustomColor = value && !COLOR_PRESETS.includes(value);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Preset swatches */}
      {COLOR_PRESETS.map((color) => (
        <button
          key={color}
          className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
          style={{
            backgroundColor: color,
            borderColor: value === color ? 'white' : 'transparent',
          }}
          onClick={() => onChange(color)}
        >
          {value === color && (
            <Check className="w-3 h-3" style={{ color: getContrastColor(color) }} />
          )}
        </button>
      ))}

      {/* Custom color swatch (shows current custom color if set) */}
      {isCustomColor && (
        <button
          className="w-7 h-7 rounded-full border-2 border-white transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
          style={{ backgroundColor: value }}
          onClick={() => inputRef.current?.click()}
        >
          <Check className="w-3 h-3" style={{ color: getContrastColor(value) }} />
        </button>
      )}

      {/* Color wheel trigger button */}
      <button
        className="w-7 h-7 rounded-full border-2 border-transparent transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
        style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }}
        onClick={() => inputRef.current?.click()}
        title="Custom color"
      >
        <Palette className="w-3 h-3 text-white drop-shadow" />
      </button>

      {/* Hidden native color input */}
      <input
        ref={inputRef}
        type="color"
        value={isCustomColor ? value : '#7c3aed'}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />
    </div>
  );
}