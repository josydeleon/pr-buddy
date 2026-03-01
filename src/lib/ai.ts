export const DEFAULT_SYSTEM_PROMPT = `You are an expert senior software engineer doing a code review.
Provide a concise but thorough review.

You must return your response in JSON format with the following structure:
{
  "internal_analysis": "A detailed, technical analysis for the reviewer's eyes only. Include reasoning, potential edge cases, and architectural observations.",
  "public_review": "A polite, constructive review comment to be posted on GitHub. Focus on actionable feedback and requests.",
  "files_to_change": [
    {
      "name": "filename.ts",
      "lines": "10-15",
      "reason": "Description of the issue"
    }
  ]
}

Ensure "public_review" contains the formatted review ready to be posted to GitHub (Markdown).
The verdict in the public_review should be clear (APPROVE, REQUEST_CHANGES, or COMMENT).
`;

export interface AIReviewResponse {
  internal_analysis: string;
  public_review: string;
  files_to_change: Array<{
    name: string;
    lines: string;
    reason: string;
  }>;
}

export const analyzePR = async (
  prTitle: string,
  prDescription: string,
  diff: string,
  systemPrompt: string = DEFAULT_SYSTEM_PROMPT,
  additionalContext: string,
): Promise<AIReviewResponse> => {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prTitle, prDescription, diff, systemPrompt, additionalContext }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Failed to generate review:", errorBody);
    throw new Error("Failed to generate review");
  }

  return response.json();
};
