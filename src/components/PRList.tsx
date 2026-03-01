import { PRItem } from "./PRItem";
import { useStore } from "../store/useStore";
import type { PullRequest } from "../lib/github";

interface PRListProps {
  pullRequests: PullRequest[];
}

export const PRList = ({ pullRequests }: PRListProps) => {
  const { selectedRepo } = useStore();

  if (!selectedRepo) {
    return null;
  }

  return (
    <div className="p-6 space-y-4">
      {pullRequests.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">
          No matching pull requests found.
        </p>
      ) : (
        pullRequests.map((pr) => (
          <PRItem
            key={pr.id}
            pr={pr}
            owner={selectedRepo.owner.login}
            repo={selectedRepo.name}
          />
        ))
      )}
    </div>
  );
};
