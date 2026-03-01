import { Octokit } from "@octokit/rest";

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  state: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  draft: boolean;
  head: {
    ref: string;
  };
  base: {
    ref: string;
  };
  labels: {
    id: number;
    name: string;
    color: string;
    description: string | null;
  }[];
  changed_files?: number;
  additions?: number;
  deletions?: number;
}

export const createOctokit = (token: string) => {
  return new Octokit({
    auth: token,
  });
};

export interface User {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  html_url: string;
}

export const getUser = async (token: string): Promise<User> => {
  const octokit = createOctokit(token);
  const response = await octokit.users.getAuthenticated();
  return response.data as User;
};

export const getRepositories = async (token: string): Promise<Repository[]> => {
  const octokit = createOctokit(token);
  // Fetch user repos (including private ones if token has access)
  const response = await octokit.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 100,
    type: "all",
  });
  return response.data as Repository[];
};

export const getPullRequests = async (
  token: string,
  owner: string,
  repo: string,
): Promise<PullRequest[]> => {
  const octokit = createOctokit(token);
  const response = await octokit.pulls.list({
    owner,
    repo,
    state: "open",
    sort: "updated",
    direction: "desc",
  });
  return response.data as PullRequest[];
};

export const getPullRequestDetails = async (
  token: string,
  owner: string,
  repo: string,
  pull_number: number,
): Promise<PullRequest> => {
  const octokit = createOctokit(token);
  const response = await octokit.pulls.get({
    owner,
    repo,
    pull_number,
  });
  return response.data as PullRequest;
};

export const getPRDiff = async (
  token: string,
  owner: string,
  repo: string,
  pull_number: number,
): Promise<string> => {
  const octokit = createOctokit(token);
  const response = await octokit.pulls.get({
    owner,
    repo,
    pull_number,
    mediaType: {
      format: "diff",
    },
  });
  // When using format: "diff", the response data is the diff string
  return response.data as unknown as string;
};

export const postReview = async (
  token: string,
  owner: string,
  repo: string,
  pull_number: number,
  body: string,
  event: "APPROVE" | "REQUEST_CHANGES" | "COMMENT",
) => {
  const octokit = createOctokit(token);
  await octokit.pulls.createReview({
    owner,
    repo,
    pull_number,
    body,
    event,
  });
};
