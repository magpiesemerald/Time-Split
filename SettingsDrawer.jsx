const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Plus, Minus, Trash2 } from 'lucide-react';
import ColorPicker from './ColorPicker';
import { TIME_FORMATS, DEFAULT_COLORS, triggerHaptic } from '@/lib/stopwatchUtils';
import { useAuth } from '@/lib/AuthContext';

export default function SettingsDrawer({
  open,
  onOpenChange,
  sections,
  setSections,
  timeFormat,
  setTimeFormat,
  confirmReset,
  setConfirmReset,
}) {
  const { isAuthenticated, logout } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Placeholder: call account deletion API when available
      // await db.auth.deleteAccount();
      console.log('Account deletion requested');
      logout();
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const addSection = () => {
    triggerHaptic();
    const idx = sections.length;
    setSections(prev => [
      ...prev,
      {
        id: Date.now(),
        label: `Timer ${idx + 1}`,
        color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
        elapsed: 0,
        isRunning: false,
      },
    ]);
  };

  const removeSection = (id) => {
    triggerHaptic();
    if (sections.length <= 1) return;
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const updateSection = (id, data) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const resetAll = () => {
    triggerHaptic();
    setSections(prev => prev.map(s => ({ ...s, elapsed: 0, isRunning: false })));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-card border-border max-h-[85vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-foreground font-sans text-lg">Settings</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pb-8">
          {/* Time Format */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Time Format</Label>
            <RadioGroup
              value={timeFormat}
              onValueChange={setTimeFormat}
              className="grid grid-cols-2 gap-2"
            >
              {Object.entries(TIME_FORMATS).map(([key, { label }]) => (
                <label
                  key={key}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                    timeFormat === key
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-secondary/50 text-muted-foreground hover:border-muted-foreground'
                  }`}
                >
                  <RadioGroupItem value={key} />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          <Separator className="bg-border" />

          {/* Sections */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                Timers ({sections.length})
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-border"
                  onClick={() => sections.length > 1 && removeSection(sections[sections.length - 1].id)}
                  disabled={sections.length <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-sm font-mono text-foreground w-6 text-center">
                  {sections.length}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-border"
                  onClick={addSection}
                  disabled={sections.length >= 8}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {sections.map((section, idx) => (
                <div
                  key={section.id}
                  className="p-3 rounded-xl border border-border bg-secondary/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <Input
                        value={section.label}
                        onChange={(e) => updateSection(section.id, { label: e.target.value })}
                        className="h-8 text-sm bg-transparent border-none px-0 font-medium text-foreground focus-visible:ring-0"
                        placeholder={`Timer ${idx + 1}`}
                      />
                      <span className="text-[10px] text-muted-foreground shrink-0 select-none">Edit</span>
                    </div>
                    {sections.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeSection(section.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                  <ColorPicker
                    value={section.color}
                    onChange={(color) => updateSection(section.id, { color })}
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Confirm Reset Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-foreground">Confirm before reset</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Show a confirmation pop-up when resetting a timer</p>
            </div>
            <Switch
              checked={confirmReset}
              onCheckedChange={setConfirmReset}
            />
          </div>

          <Separator className="bg-border" />

          {/* Reset All */}
          <Button
            variant="destructive"
            className="w-full"
            onClick={resetAll}
          >
            Reset All Timers
          </Button>

          {/* Account */}
          {isAuthenticated && (
            <>
              <Separator className="bg-border" />
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">Account</Label>
                <Button
                  variant="outline"
                  className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Account
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>

      {/* Delete account confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete your account?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action is permanent and cannot be undone. All your data will be erased.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border" disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting…' : 'Delete Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}