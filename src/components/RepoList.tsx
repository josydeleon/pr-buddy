import { useState } from "react";
import { useStore } from "../store/useStore";
import { Search, Star, Settings as SettingsIcon } from "lucide-react";
import clsx from "clsx";
import { Settings } from "./Settings";
import { useRepositories } from "../hooks/useGithub";

export const RepoList = () => {
  const { selectedRepo, setSelectedRepo, user } = useStore();
  const [filter, setFilter] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const { repositories } = useRepositories();

  const filteredRepos = repositories.filter((repo) =>
    repo.name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full border-r border-border bg-card">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-8 pr-4 py-2 text-sm border rounded-md bg-input border-input focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredRepos.map((repo) => (
          <div
            key={repo.id}
            onClick={() => setSelectedRepo(repo)}
            className={clsx(
              "p-4 cursor-pointer hover:bg-accent/50 transition-colors border-b border-border/50",
              selectedRepo?.id === repo.id ? "bg-accent" : "",
            )}
          >
            <div className="font-medium text-foreground">{repo.name}</div>
            <div className="flex items-center mt-1 space-x-4 text-xs text-muted-foreground">
              <span className="flex items-center text-yellow-500">
                <Star className="w-3 h-3 mr-1 fill-yellow-500" />
                {repo.stargazers_count}
              </span>
              {repo.language && (
                <span className="text-blue-400">{repo.language}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border mt-auto">
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center w-full p-2 text-sm font-medium text-foreground hover:bg-accent rounded-md transition-colors text-left"
        >
          {user ? (
            <>
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-8 h-8 rounded-full mr-3 border border-border"
              />
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-semibold">
                  {user.name || user.login}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Settings
                </p>
              </div>
              <SettingsIcon className="w-4 h-4 text-muted-foreground ml-2" />
            </>
          ) : (
            <div className="flex items-center justify-center w-full">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Settings
            </div>
          )}
        </button>
      </div>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
};
