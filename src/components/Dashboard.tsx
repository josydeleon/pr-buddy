import { Suspense, useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import { RepoList } from "./RepoList";
import { PRList } from "./PRList";
import { TokenInput } from "./TokenInput";
import {
  Loader2,
  ExternalLink,
  Search,
  ArrowLeft,
  RefreshCw,
  ArrowUpDown,
  GitPullRequest,
  SidebarClose,
  SidebarOpen,
} from "lucide-react";
import { ErrorBoundary } from "./ErrorBoundary";
import clsx from "clsx";
import { usePullRequestsWithDetails } from "../hooks/useGithub";
import { Tabs } from "./Tabs";
import { AIReviewList } from "./AIReviewList";
import type { PullRequest } from "../lib/github";

type SortOrder = "newest" | "oldest";

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full w-full">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

export const Dashboard = () => {
  const { token, selectedRepo, setToken, setSelectedRepo } = useStore();
  const [activeTab, setActiveTab] = useState("ai-review");
  const [filter, setFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { pullRequests, refetch, isRefetching, lastUpdated, isLoading } =
    usePullRequestsWithDetails();

  useEffect(() => {
    // If token is in .env, set it automatically if not already set
    const envToken = import.meta.env.VITE_GITHUB_TOKEN;
    if (envToken && !token) {
      setToken(envToken);
    }
  }, [setToken, token]);

  if (!token) {
    return <TokenInput />;
  }

  const tabs = [
    { id: "all-prs", label: "All Pull Requests" },
    { id: "ai-review", label: "AI Review Candidates" },
  ];

  const filteredPRs = pullRequests
    .filter(
      (pr: PullRequest) =>
        pr.title.toLowerCase().includes(filter.toLowerCase()) ||
        pr.user.login.toLowerCase().includes(filter.toLowerCase()) ||
        String(pr.number).includes(filter),
    )
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="flex h-full bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <div
        className={clsx(
          "border-r border-border h-full flex flex-col transition-all duration-300 ease-in-out flex-shrink-0",
          !selectedRepo && "w-full md:w-80",
          selectedRepo && "hidden md:flex",
          selectedRepo && isSidebarOpen && "md:w-80",
          selectedRepo && !isSidebarOpen && "md:w-0 md:border-0",
        )}
      >
        <div
          className={clsx(
            "flex-1 overflow-y-auto",
            !isSidebarOpen && selectedRepo && "invisible",
          )}
        >
          <ErrorBoundary
            fallback={
              <div className="p-4 text-destructive">
                Failed to load repositories
              </div>
            }
          >
            <Suspense fallback={<LoadingFallback />}>
              <RepoList />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={clsx(
          "flex-1 overflow-hidden relative h-full flex flex-col",
          !selectedRepo && "hidden md:flex",
        )}
      >
        {selectedRepo ? (
          <>
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center overflow-hidden mr-2">
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="hidden md:flex mr-2 p-1.5 -ml-1.5 hover:bg-accent rounded-full text-foreground transition-colors flex-shrink-0"
                    title={
                      isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"
                    }
                  >
                    {isSidebarOpen ? (
                      <SidebarClose className="w-5 h-5" />
                    ) : (
                      <SidebarOpen className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedRepo(null)}
                    className="md:hidden mr-2 p-1.5 -ml-1.5 hover:bg-accent rounded-full text-foreground transition-colors flex-shrink-0"
                    aria-label="Back to repositories"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-2xl font-bold flex items-center text-foreground truncate">
                    {selectedRepo.full_name}
                    <a
                      href={selectedRepo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-500 hover:text-blue-400 flex-shrink-0"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </h2>
                </div>
                <button
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  className={`flex-shrink-0 p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-all ${isRefetching ? "animate-spin" : ""}`}
                  title="Refresh Pull Requests"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              <div className="flex justify-between items-start mt-1">
                <p className="text-muted-foreground line-clamp-2">
                  {selectedRepo.description}
                </p>
                {lastUpdated && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4 pt-1">
                    Updated {new Date(lastUpdated).toLocaleTimeString()}
                  </span>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search pull requests..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 text-sm border rounded-md bg-input border-input focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
                <button
                  onClick={() =>
                    setSortOrder((prev) =>
                      prev === "newest" ? "oldest" : "newest",
                    )
                  }
                  className="flex items-center px-3 py-2 text-sm border rounded-md bg-input border-input hover:bg-accent hover:text-accent-foreground transition-colors min-w-[100px] justify-center"
                  title={`Sort by ${sortOrder === "newest" ? "Oldest" : "Newest"}`}
                >
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  {sortOrder === "newest" ? "Newest" : "Oldest"}
                </button>
              </div>
            </div>
            <Tabs
              tabs={tabs}
              onTabChange={setActiveTab}
              activeTab={activeTab}
            />
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <LoadingFallback />
              ) : (
                <ErrorBoundary
                  fallback={
                    <div className="p-4 text-destructive">
                      Failed to load pull requests
                    </div>
                  }
                >
                  {activeTab === "all-prs" ? (
                    <PRList pullRequests={filteredPRs} />
                  ) : (
                    <AIReviewList pullRequests={filteredPRs} />
                  )}
                </ErrorBoundary>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <GitPullRequest className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a repository to view pull requests</p>
          </div>
        )}
      </div>
    </div>
  );
};
