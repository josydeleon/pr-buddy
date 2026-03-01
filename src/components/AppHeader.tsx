import { useState } from "react";
import { Settings as SettingsIcon, GitPullRequest } from "lucide-react";
import { Settings } from "./Settings";
import { useStore } from "../store/useStore";
import { useUser } from "../hooks/useGithub";

export const AppHeader = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { user } = useStore();
  useUser();

  return (
    <>
      <header className="flex items-center justify-between p-4 border-b border-border bg-background flex-shrink-0">
        <div className="flex items-center gap-2">
          <GitPullRequest className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold">PR Buddy</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
          {user && (
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-8 h-8 rounded-full"
              title={`Logged in as ${user.name || user.login}`}
            />
          )}
        </div>
      </header>
      {isSettingsOpen && <Settings onClose={() => setIsSettingsOpen(false)} />}
    </>
  );
};
