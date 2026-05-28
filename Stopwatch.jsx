import React, { useState, useCallback, useEffect } from 'react';
import { Settings, PictureInPicture2, X } from 'lucide-react';
import SectionGrid from '@/components/stopwatch/SectionGrid';
import SettingsDrawer from '@/components/stopwatch/SettingsDrawer';
import { createDefaultSection, triggerHaptic } from '@/lib/stopwatchUtils';
import { usePictureInPicture } from '@/hooks/usePictureInPicture';

// Inner app content — rendered both in main window and PiP window
export function StopwatchContent({
  sections, setSections, timeFormat, setTimeFormat,
  onStart, onStop, onReset, confirmReset, setConfirmReset,
  settingsOpen, setSettingsOpen, isPiP,
}) {
  return (
    <div className="fixed inset-0 flex flex-col bg-background overflow-hidden">
      <div className="flex-1 relative">
        <SectionGrid
          sections={sections}
          timeFormat={timeFormat}
          onStart={onStart}
          onStop={onStop}
          onReset={onReset}
          confirmReset={confirmReset}
        />
      </div>

      {/* Settings button */}
      <button
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-2.5 rounded-full bg-card/80 backdrop-blur-xl border border-border shadow-2xl transition-all hover:bg-card active:scale-95"
        onClick={() => {
          triggerHaptic();
          setSettingsOpen(true);
        }}
      >
        <Settings className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-medium text-foreground tracking-wide">Settings</span>
      </button>

      <SettingsDrawer
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        sections={sections}
        setSections={setSections}
        timeFormat={timeFormat}
        setTimeFormat={setTimeFormat}
        confirmReset={confirmReset}
        setConfirmReset={setConfirmReset}
      />
    </div>
  );
}

export default function Stopwatch() {
  const [sections, setSections] = useState([
    createDefaultSection(0),
    createDefaultSection(1),
  ]);
  const [timeFormat, setTimeFormat] = useState('s');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pipSettingsOpen, setPipSettingsOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(true);

  const { isPiP, isSupported, openPiP, closePiP, updatePiP } = usePictureInPicture();

  const handleStart = useCallback((id, currentDisplay) => {
    setSections(prev =>
      prev.map(s => s.id === id ? { ...s, elapsed: currentDisplay, isRunning: true } : s)
    );
  }, []);

  const handleStop = useCallback((id, currentDisplay) => {
    setSections(prev =>
      prev.map(s => s.id === id ? { ...s, elapsed: currentDisplay, isRunning: false } : s)
    );
  }, []);

  const handleReset = useCallback((id) => {
    setSections(prev =>
      prev.map(s => s.id === id ? { ...s, elapsed: 0, isRunning: false } : s)
    );
  }, []);

  // Keep PiP content in sync with latest state
  useEffect(() => {
    if (!isPiP) return;
    updatePiP(
      <StopwatchContent
        sections={sections}
        setSections={setSections}
        timeFormat={timeFormat}
        setTimeFormat={setTimeFormat}
        onStart={handleStart}
        onStop={handleStop}
        onReset={handleReset}
        confirmReset={confirmReset}
        setConfirmReset={setConfirmReset}
        settingsOpen={pipSettingsOpen}
        setSettingsOpen={setPipSettingsOpen}
        isPiP={true}
      />
    );
  }, [isPiP, sections, timeFormat, confirmReset, pipSettingsOpen, updatePiP, handleStart, handleStop, handleReset]);

  const handleOpenPiP = async () => {
    triggerHaptic();
    await openPiP(
      <StopwatchContent
        sections={sections}
        setSections={setSections}
        timeFormat={timeFormat}
        setTimeFormat={setTimeFormat}
        onStart={handleStart}
        onStop={handleStop}
        onReset={handleReset}
        confirmReset={confirmReset}
        setConfirmReset={setConfirmReset}
        settingsOpen={pipSettingsOpen}
        setSettingsOpen={setPipSettingsOpen}
        isPiP={true}
      />
    );
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background overflow-hidden">
      <div className="flex-1 relative">
        <SectionGrid
          sections={sections}
          timeFormat={timeFormat}
          onStart={handleStart}
          onStop={handleStop}
          onReset={handleReset}
          confirmReset={confirmReset}
        />
      </div>

      {/* Bottom bar */}
      <div className="fixed left-1/2 -translate-x-1/2 z-50 flex items-center gap-2" style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
        {/* PiP toggle button */}
        {isSupported && (
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-card/80 backdrop-blur-xl border border-border shadow-2xl transition-all hover:bg-card active:scale-95"
            onClick={isPiP ? closePiP : handleOpenPiP}
            title={isPiP ? 'Close Picture-in-Picture' : 'Open in Picture-in-Picture'}
          >
            {isPiP ? (
              <>
                <X className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground tracking-wide">Close PiP</span>
              </>
            ) : (
              <>
                <PictureInPicture2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground tracking-wide">Pop Out</span>
              </>
            )}
          </button>
        )}

        {/* Settings button */}
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-card/80 backdrop-blur-xl border border-border shadow-2xl transition-all hover:bg-card active:scale-95"
          onClick={() => {
            triggerHaptic();
            setSettingsOpen(true);
          }}
        >
          <Settings className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground tracking-wide">Settings</span>
        </button>
      </div>

      <SettingsDrawer
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        sections={sections}
        setSections={setSections}
        timeFormat={timeFormat}
        setTimeFormat={setTimeFormat}
        confirmReset={confirmReset}
        setConfirmReset={setConfirmReset}
      />
    </div>
  );
}