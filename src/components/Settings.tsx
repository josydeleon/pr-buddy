import { useState } from "react";
import { useStore } from "../store/useStore";
import { X, Save, RotateCcw } from "lucide-react";
import { DEFAULT_SYSTEM_PROMPT } from "../lib/ai";

interface SettingsProps {
  onClose: () => void;
}

export const Settings = ({ onClose }: SettingsProps) => {
  const {
    token,
    systemPrompt,
    fontSize,
    aiFileCountThreshold,
    aiChangesThreshold,
    setToken,
    setSystemPrompt,
    setFontSize,
    setAiFileCountThreshold,
    setAiChangesThreshold,
    clearStorage,
  } = useStore();

  const [localToken, setLocalToken] = useState(token);
  const [localPrompt, setLocalPrompt] = useState(systemPrompt);
  const [localFontSize, setLocalFontSize] = useState(fontSize);
  const [localAiFileCount, setLocalAiFileCount] =
    useState(aiFileCountThreshold);
  const [localAiChanges, setLocalAiChanges] = useState(aiChangesThreshold);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setToken(localToken);
    setSystemPrompt(localPrompt);
    setFontSize(localFontSize);
    setAiFileCountThreshold(localAiFileCount);
    setAiChangesThreshold(localAiChanges);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleClearStorage = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all local data? This action cannot be undone.",
      )
    ) {
      clearStorage();
      onClose();
      window.location.reload(); // Reload to apply changes and show token screen
    }
  };

  const handleResetPrompt = () => {
    setLocalPrompt(DEFAULT_SYSTEM_PROMPT);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background border border-border rounded-lg shadow-xl p-4 md:p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-foreground">Settings</h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              GitHub Token
            </label>
            <input
              type="password"
              value={localToken}
              onChange={(e) => setLocalToken(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-input border-input focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>

          <div className="space-y-4 border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-foreground">
              AI Candidate Criteria
            </h3>
            <p className="text-sm text-muted-foreground">
              Set the thresholds to consider a Pull Request as a candidate for
              AI review.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Min. Files Changed
                </label>
                <input
                  type="number"
                  min="1"
                  value={localAiFileCount}
                  onChange={(e) => setLocalAiFileCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md bg-input border-input focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Min. Lines Changed (Add + Del)
                </label>
                <input
                  type="number"
                  min="1"
                  value={localAiChanges}
                  onChange={(e) => setLocalAiChanges(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md bg-input border-input focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Font Size (px)
            </label>
            <input
              type="number"
              min="10"
              max="24"
              value={localFontSize}
              onChange={(e) => setLocalFontSize(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md bg-input border-input focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-foreground">
                Agent System Prompt
              </label>
              <button
                onClick={handleResetPrompt}
                className="text-xs flex items-center text-muted-foreground hover:text-primary"
                title="Reset to default prompt"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset Default
              </button>
            </div>
            <textarea
              value={localPrompt}
              onChange={(e) => setLocalPrompt(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border rounded-md bg-input border-input focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Customize the instructions given to the AI reviewer.
            </p>
          </div>

          <div className="space-y-4 border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-destructive">
              Danger Zone
            </h3>
            <p className="text-sm text-muted-foreground">
              This action will reset all your settings, including your GitHub
              token and other configurations. Your saved analyses will be lost.
            </p>
            <button
              onClick={handleClearStorage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-md text-sm font-medium"
            >
              Clear Local Storage & Reset Settings
            </button>
          </div>

          <div className="pt-4 flex justify-end items-center border-t border-border mt-6 gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
