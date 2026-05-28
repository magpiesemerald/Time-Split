export const DEFAULT_COLORS = [
  '#6C5CE7', // Purple
  '#00CEC9', // Teal
  '#FF6B6B', // Coral
  '#FDCB6E', // Yellow
  '#0984E3', // Blue
  '#E17055', // Orange
  '#00B894', // Green
  '#A29BFE', // Lavender
];

export const COLOR_PRESETS = [
  '#6C5CE7', '#0984E3', '#00CEC9', '#00B894',
  '#FDCB6E', '#E17055', '#FF6B6B', '#D63031',
  '#A29BFE', '#74B9FF', '#55EFC4', '#FFEAA7',
  '#FF7675', '#FD79A8', '#E84393', '#636E72',
];

export const TIME_FORMATS = {
  ms: { label: 'Milliseconds', suffix: 'ms', divisor: 1 },
  s: { label: 'Seconds', suffix: 's', divisor: 1000 },
  min: { label: 'Minutes', suffix: 'min', divisor: 60000 },
  hr: { label: 'Hours', suffix: 'hr', divisor: 3600000 },
};

export function formatTime(elapsedMs, format) {
  const { divisor, suffix } = TIME_FORMATS[format] || TIME_FORMATS.s;

  if (format === 'ms') {
    return { value: Math.floor(elapsedMs).toString(), suffix };
  }

  const value = elapsedMs / divisor;
  
  if (format === 's') {
    const secs = Math.floor(value);
    const ms = Math.floor((elapsedMs % 1000) / 10);
    return { value: `${secs}.${ms.toString().padStart(2, '0')}`, suffix };
  }

  if (format === 'min') {
    const mins = Math.floor(value);
    const secs = Math.floor((elapsedMs % 60000) / 1000);
    return { value: `${mins}:${secs.toString().padStart(2, '0')}`, suffix };
  }

  if (format === 'hr') {
    const hrs = Math.floor(value);
    const mins = Math.floor((elapsedMs % 3600000) / 60000);
    const secs = Math.floor((elapsedMs % 60000) / 1000);
    return { value: `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`, suffix };
  }

  return { value: value.toFixed(2), suffix };
}

export function getContrastColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#1a1a2e' : '#ffffff';
}

export function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function triggerHaptic() {
  if (navigator.vibrate) {
    navigator.vibrate(15);
  }
}

export function createDefaultSection(index) {
  return {
    id: Date.now() + index,
    label: `Timer ${index + 1}`,
    color: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    elapsed: 0,
    isRunning: false,
  };
}