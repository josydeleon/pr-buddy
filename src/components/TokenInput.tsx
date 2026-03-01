import React, { useState } from "react";
import { useStore } from "../store/useStore";
import { Key } from "lucide-react";

export const TokenInput = () => {
  const [ghToken, setGhToken] = useState("");
  const { setToken } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ghToken.trim()) {
      setToken(ghToken.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
      <div className="w-full max-w-md p-8 space-y-6 border rounded-lg shadow-lg bg-card border-border">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Key className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Welcome to PR Buddy</h1>
          </div>
          <p className="text-muted-foreground">
            Connect your GitHub account to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="token"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              GitHub Personal Access Token
            </label>
            <input
              id="token"
              type="password"
              value={ghToken}
              onChange={(e) => setGhToken(e.target.value)}
              placeholder="ghp_..."
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground">
              Create a token with <code>repo</code> and <code>user</code>{" "}
              scopes.
            </p>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
          >
            Connect
          </button>
        </form>
      </div>
    </div>
  );
};
