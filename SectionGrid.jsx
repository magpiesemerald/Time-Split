import React from 'react';
import StopwatchSection from './StopwatchSection';

function getGridLayout(count) {
  if (count === 1) return 'grid-cols-1 grid-rows-1';
  if (count === 2) return 'grid-cols-1 grid-rows-2';
  if (count === 3) return 'grid-cols-1 grid-rows-3';
  if (count === 4) return 'grid-cols-2 grid-rows-2';
  if (count <= 6) return 'grid-cols-2 grid-rows-3';
  if (count <= 8) return 'grid-cols-2 grid-rows-4';
  return 'grid-cols-3 grid-rows-3';
}

export default function SectionGrid({ sections, timeFormat, onStart, onStop, onReset, confirmReset }) {
  const gridClass = getGridLayout(sections.length);

  return (
    <div className={`grid ${gridClass} w-full h-full gap-0`}>
      {sections.map((section) => (
        <StopwatchSection
          key={section.id}
          section={section}
          timeFormat={timeFormat}
          onStart={onStart}
          onStop={onStop}
          onReset={onReset}
          confirmReset={confirmReset}
        />
      ))}
    </div>
  );
}