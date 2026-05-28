import React, { useRef, useCallback, useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { formatTime, getContrastColor, hexToRgba, triggerHaptic } from '@/lib/stopwatchUtils';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function StopwatchSection({ section, timeFormat, onStart, onStop, onReset, confirmReset }) {
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const [displayTime, setDisplayTime] = useState(section.elapsed);
  const [isPressed, setIsPressed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  // Saved elapsed time at the moment the dialog opens, so we can restore it on cancel
  const frozenTimeRef = useRef(0);
  const textColor = getContrastColor(section.color);
  const dimColor = hexToRgba(textColor, 0.5);

  // Sync display time when section.elapsed changes externally (like reset)
  useEffect(() => {
    if (!section.isRunning) {
      setDisplayTime(section.elapsed);
    }
  }, [section.elapsed, section.isRunning]);

  // High-frequency display update when running
  useEffect(() => {
    if (section.isRunning) {
      startTimeRef.current = performance.now() - section.elapsed;
      intervalRef.current = setInterval(() => {
        setDisplayTime(performance.now() - startTimeRef.current);
      }, 16); // ~60fps
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [section.isRunning]);

  const handlePressStart = useCallback((e) => {
    e.preventDefault();
    setIsPressed(true);
    triggerHaptic();
    onStart(section.id, displayTime);
  }, [section.id, displayTime, onStart]);

  const handlePressEnd = useCallback((e) => {
    e.preventDefault();
    if (isPressed) {
      setIsPressed(false);
      onStop(section.id, displayTime);
    }
  }, [section.id, displayTime, isPressed, onStop]);

  const handleResetClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirmReset) {
      // Freeze & stop the timer before showing the dialog
      frozenTimeRef.current = displayTime;
      if (isPressed) {
        setIsPressed(false);
        onStop(section.id, displayTime);
      }
      setShowConfirm(true);
    } else {
      triggerHaptic();
      onReset(section.id);
      setDisplayTime(0);
    }
  }, [section.id, onReset, confirmReset, displayTime, isPressed, onStop]);

  const handleConfirmReset = useCallback(() => {
    triggerHaptic();
    onReset(section.id);
    setDisplayTime(0);
    setShowConfirm(false);
  }, [section.id, onReset]);

  const handleCancelReset = useCallback(() => {
    // Restore the frozen time and close — do NOT restart the timer
    setDisplayTime(frozenTimeRef.current);
    setShowConfirm(false);
  }, []);

  const { value, suffix } = formatTime(displayTime, timeFormat);

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none"
      style={{ backgroundColor: section.color }}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Pulse overlay when active */}
      {isPressed && (
        <div
          className="absolute inset-0 animate-pulse-glow pointer-events-none"
          style={{ backgroundColor: hexToRgba(textColor, 0.08) }}
        />
      )}

      {/* Label */}
      <p
        className="text-xs font-sans font-medium tracking-widest uppercase mb-2 opacity-60"
        style={{ color: textColor }}
      >
        {section.label}
      </p>

      {/* Timer display */}
      <div className="flex items-baseline gap-1">
        <span
          className="font-mono font-bold tabular-nums leading-none"
          style={{
            color: textColor,
            fontSize: 'clamp(2rem, 8vw, 5rem)',
          }}
        >
          {value}
        </span>
        <span
          className="font-mono text-sm font-medium"
          style={{ color: dimColor }}
        >
          {suffix}
        </span>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-1.5 mt-3">
        <div
          className="w-1.5 h-1.5 rounded-full transition-all duration-200"
          style={{
            backgroundColor: isPressed ? '#4ade80' : dimColor,
            boxShadow: isPressed ? '0 0 8px rgba(74,222,128,0.6)' : 'none',
          }}
        />
        <span
          className="text-[10px] font-sans font-medium uppercase tracking-wider"
          style={{ color: dimColor }}
        >
          {isPressed ? 'Running' : displayTime > 0 ? 'Paused' : 'Hold to start'}
        </span>
      </div>

      {/* Middle-left reset button */}
      {displayTime > 0 && !isPressed && (
        <button
          className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: hexToRgba(textColor, 0.15),
            color: textColor,
          }}
          onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
          onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); }}
          onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); handleResetClick(e); }}
          onClick={handleResetClick}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium uppercase tracking-wider">Reset</span>
        </button>
      )}

      {/* Confirm reset dialog */}
      <AlertDialog open={showConfirm} onOpenChange={() => {}}>
        <AlertDialogContent
          className="bg-card border-border"
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Reset timer?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will reset <strong style={{ color: section.color }}>{section.label}</strong> back to zero.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => { e.stopPropagation(); handleCancelReset(); }}
              onClick={handleCancelReset}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => { e.stopPropagation(); handleConfirmReset(); }}
              onClick={handleConfirmReset}
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}