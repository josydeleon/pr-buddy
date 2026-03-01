import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import {
  GitPullRequest,
  GitMerge,
  Calendar,
  User,
  Bot,
  Check,
  X,
  Maximize2,
  Eye,
  Edit2,
  Link as LinkIcon,
  CheckCircle2,
  FileCode2,
  PlusCircle,
  MinusCircle,
  ExternalLink,
  MessageSquarePlus,
} from "lucide-react";
import { formatRelativeDate } from "../lib/date";
import { useStore } from "../store/useStore";
import { analyzePR } from "../lib/ai";
import { getPRDiff, postReview } from "../lib/github";
import type { PullRequest } from "../lib/github";
import { ReviewModal } from "./ReviewModal";

interface Props {
  pr: PullRequest;
  owner: string;
  repo: string;
}

export const PRItem = ({ pr, owner, repo }: Props) => {
  const { token, systemPrompt, savedAnalyses, saveAnalysis } = useStore();
  const [isReviewing, setIsReviewing] = useState(false);
  const [internalAnalysis, setInternalAnalysis] = useState<string | null>(null);
  const [publicReview, setPublicReview] = useState<string | null>(null);
  const [filesToChange, setFilesToChange] = useState<
    Array<{ name: string; lines: string; reason: string }>
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showContextBox, setShowContextBox] = useState(false);
  const [additionalContext, setAdditionalContext] = useState("");

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(pr.html_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL", err);
    }
  };

  // Load saved analysis if available
  useState(() => {
    const key = `${owner}/${repo}/${pr.number}`;
    const saved = savedAnalyses[key];
    if (saved) {
      setInternalAnalysis(saved.internal_analysis);
      setPublicReview(saved.public_review);
      setFilesToChange(saved.files_to_change);
    }
  });

  const handleReview = async () => {
    setIsReviewing(true);
    setError(null);
    try {
      const diff = await getPRDiff(token, owner, repo, pr.number);
      const analysis = await analyzePR(
        pr.title,
        pr.body || "No description provided",
        diff,
        systemPrompt,
        additionalContext,
      );

      setInternalAnalysis(analysis.internal_analysis);
      setPublicReview(analysis.public_review);
      setFilesToChange(analysis.files_to_change);

      // Save to store
      const key = `${owner}/${repo}/${pr.number}`;
      saveAnalysis(key, analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze PR");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleCompleteReview = async () => {
    if (!publicReview) return;

    setIsPosting(true);
    try {
      // Simple heuristic to determine event type from review text
      let event: "APPROVE" | "REQUEST_CHANGES" | "COMMENT" = "COMMENT";
      if (publicReview.includes("Verdict: APPROVE")) event = "APPROVE";
      else if (publicReview.includes("Verdict: REQUEST_CHANGES"))
        event = "REQUEST_CHANGES";

      await postReview(token, owner, repo, pr.number, publicReview, event);
      setPublicReview(null); // Clear review after posting
      // We keep the internal analysis and files to change
      alert("Review posted successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post review");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-card border-border hover:border-primary/50 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold hover:text-primary cursor-pointer text-foreground flex items-center group">
            <a
              href={pr.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              {pr.title}
              <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
            </a>
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {pr.labels?.map((label) => (
              <span
                key={label.id}
                className="px-2 py-0.5 text-xs rounded-full font-medium border"
                style={{
                  backgroundColor: `#${label.color}20`,
                  color: `#${label.color}`,
                  borderColor: `#${label.color}40`,
                }}
              >
                {label.name}
              </span>
            ))}
          </div>
          <div className="flex items-center mt-2 space-x-4 text-sm">
            <span
              className={`flex items-center font-medium ${
                pr.merged_at
                  ? "text-purple-500"
                  : pr.state === "closed"
                    ? "text-red-500"
                    : pr.draft
                      ? "text-gray-500"
                      : "text-green-500"
              }`}
            >
              {pr.merged_at ? (
                <GitMerge className="w-4 h-4 mr-1" />
              ) : (
                <GitPullRequest className="w-4 h-4 mr-1" />
              )}
              #{pr.number}
            </span>
            <span className="flex items-center text-blue-400">
              <User className="w-4 h-4 mr-1" />
              {pr.user.login}
            </span>
            <span className="flex items-center text-yellow-500">
              <Calendar className="w-4 h-4 mr-1" />
              {formatRelativeDate(pr.created_at)}
            </span>
            {pr.changed_files !== undefined && (
              <span
                className="flex items-center text-muted-foreground"
                title="Files changed"
              >
                <FileCode2 className="w-4 h-4 mr-1" />
                {pr.changed_files}
              </span>
            )}
            {pr.additions !== undefined && (
              <span
                className="flex items-center text-green-500"
                title="Additions"
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                {pr.additions}
              </span>
            )}
            {pr.deletions !== undefined && (
              <span
                className="flex items-center text-red-500"
                title="Deletions"
              >
                <MinusCircle className="w-4 h-4 mr-1" />
                {pr.deletions}
              </span>
            )}
            <button
              onClick={handleCopyUrl}
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors ml-2"
              title="Copy PR URL"
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <LinkIcon className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Review Section - Under user name as requested */}
          <div className="mt-4">
            {error && <p className="text-destructive text-sm mb-2">{error}</p>}

            <div className="mb-2">
              <button
                onClick={() => setShowContextBox(!showContextBox)}
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageSquarePlus className="w-4 h-4 mr-2" />
                {showContextBox ? "Hide" : "Add"} Context (Optional)
              </button>
              {showContextBox && (
                <textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Provide additional context for the AI review..."
                  className="mt-2 w-full p-2 bg-muted/50 rounded-md font-mono text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                  rows={3}
                />
              )}
            </div>

            {!publicReview && !isReviewing && (
              <button
                onClick={handleReview}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
              >
                <Bot className="w-4 h-4 mr-2" />
                Review PR with AI
              </button>
            )}

            {isReviewing && (
              <div className="flex items-center text-muted-foreground animate-pulse">
                <Bot className="w-4 h-4 mr-2" />
                Reviewing PR...👀
              </div>
            )}

            {publicReview && (
              <div className="mt-2 space-y-4">
                <div className="relative">
                  <div className="absolute top-2 right-2 z-10 flex gap-2">
                    <button
                      onClick={() => setIsPreview(!isPreview)}
                      className="p-1.5 bg-background/80 hover:bg-muted rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
                      title={isPreview ? "Edit" : "Preview"}
                    >
                      {isPreview ? (
                        <Edit2 className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="p-1.5 bg-background/80 hover:bg-muted rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
                      title="Expand Review"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>

                  {isPreview ? (
                    <div className="w-full h-64 p-4 bg-muted/30 rounded-md border border-border overflow-y-auto prose prose-sm dark:prose-invert max-w-none [&_pre]:whitespace-pre-wrap">
                      <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                        {publicReview || ""}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <textarea
                      value={publicReview || ""}
                      onChange={(e) => setPublicReview(e.target.value)}
                      className="w-full h-64 p-4 bg-muted/50 rounded-md font-mono text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                      placeholder="Review content..."
                    />
                  )}

                  {!isPreview && (
                    <p className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-1 rounded pointer-events-none">
                      You can edit this review before posting
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCompleteReview}
                    disabled={isPosting}
                    className="flex items-center px-4 py-2 font-bold text-primary-foreground bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isPosting ? (
                      "Posting..."
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Complete Review
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setPublicReview(null)}
                    disabled={isPosting}
                    className="flex items-center px-4 py-2 font-medium text-foreground bg-secondary rounded-md hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>

                <ReviewModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  internalAnalysis={internalAnalysis || ""}
                  publicReview={publicReview}
                  setPublicReview={setPublicReview}
                  filesToChange={filesToChange}
                  onPost={handleCompleteReview}
                  isPosting={isPosting}
                />
              </div>
            )}
          </div>
        </div>
        <div className="ml-4">
          {pr.draft && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
              Draft
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
