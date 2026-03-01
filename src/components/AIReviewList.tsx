import { PRItem } from "./PRItem";
import { useStore } from "../store/useStore";
import type { PullRequest } from "../lib/github";

interface AIReviewListProps {
  pullRequests: PullRequest[];
}

export const AIReviewList = ({ pullRequests }: AIReviewListProps) => {
  const { selectedRepo, aiFileCountThreshold, aiChangesThreshold } = useStore();

  const candidatePRs = pullRequests.filter((pr: PullRequest) => {
    if (!pr.changed_files || !pr.additions || !pr.deletions) {
      return false;
    }
    return (
      pr.changed_files > aiFileCountThreshold &&
      pr.additions + pr.deletions > aiChangesThreshold
    );
  });

  if (!selectedRepo) {
    return null;
  }

  return (
    <div className="p-6 space-y-4">
      {candidatePRs.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">
          No candidate pull requests found for AI review.
        </p>
      ) : (
        candidatePRs.map((pr: PullRequest) => (
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
