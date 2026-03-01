import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useStore } from "../store/useStore";
import {
  getRepositories,
  getPullRequests,
  getUser,
  getPullRequestDetails,
} from "../lib/github";

export const useUser = () => {
  const { token, setUser } = useStore();

  const query = useQuery({
    queryKey: ["user", token],
    queryFn: async () => {
      if (!token) return null;
      const user = await getUser(token);
      setUser(user);
      return user;
    },
    enabled: !!token,
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
  };
};

export const useRepositories = () => {
  const { token } = useStore();

  const query = useSuspenseQuery({
    queryKey: ["repos", token],
    queryFn: async () => {
      if (!token) return [];
      return getRepositories(token);
    },
  });

  return {
    repositories: query.data,
  };
};

export const usePullRequestsWithDetails = () => {
  const { token, selectedRepo } = useStore();

  const query = useQuery({
    queryKey: [
      "prsWithDetails",
      token,
      selectedRepo?.owner.login,
      selectedRepo?.name,
    ],
    queryFn: async () => {
      if (!token || !selectedRepo) return [];

      const prs = await getPullRequests(
        token,
        selectedRepo.owner.login,
        selectedRepo.name,
      );

      const prsWithDetails = await Promise.all(
        prs.map((pr) =>
          getPullRequestDetails(
            token,
            selectedRepo.owner.login,
            selectedRepo.name,
            pr.number,
          ),
        ),
      );

      return prsWithDetails;
    },
    enabled: !!selectedRepo,
    refetchInterval: 60000, // Poll every 60s
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  return {
    pullRequests: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    lastUpdated: query.dataUpdatedAt,
  };
};
