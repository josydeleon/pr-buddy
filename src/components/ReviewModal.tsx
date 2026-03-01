import {
  X,
  AlertCircle,
  FileCode,
  Eye,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface FileChange {
  name: string;
  lines: string;
  reason: string;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  internalAnalysis: string;
  publicReview: string;
  setPublicReview: (content: string) => void;
  filesToChange: FileChange[];
  onPost: () => void;
  isPosting: boolean;
}

export const ReviewModal = ({
  isOpen,
  onClose,
  internalAnalysis,
  publicReview,
  setPublicReview,
  filesToChange,
  onPost,
  isPosting,
}: ReviewModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"public" | "internal">("public");

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        ref={modalRef}
        className="bg-background w-full max-w-[95vw] h-[90vh] rounded-lg shadow-xl flex flex-col border border-border"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileCode className="w-5 h-5 text-primary" />
              AI Review Analysis
            </h2>
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setActiveTab("public")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                  activeTab === "public"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Public Review (To GitHub)
              </button>
              <button
                onClick={() => setActiveTab("internal")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                  activeTab === "internal"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye className="w-4 h-4" />
                Internal Analysis (For You)
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Panel: Files to Change */}
          <div className="w-full md:w-1/4 border-r border-border p-4 overflow-y-auto bg-muted/10">
            <h3 className="font-medium mb-3 flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              Files Requiring Attention
            </h3>
            {filesToChange.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No specific files flagged for changes.
              </p>
            ) : (
              <div className="space-y-3">
                {filesToChange.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-card border border-border rounded-md text-sm shadow-sm"
                  >
                    <div className="font-semibold text-foreground break-all">
                      {file.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Lines: {file.lines}
                    </div>
                    <div className="mt-2 text-muted-foreground border-l-2 border-destructive/50 pl-2 text-xs">
                      {file.reason}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel: Content */}
          <div className="w-full md:w-3/4 flex flex-col overflow-hidden bg-card">
            {activeTab === "public" ? (
              <div className="flex-1 flex flex-col p-4 h-full">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Review Comment (Markdown)</h3>
                  <span className="text-xs text-muted-foreground bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full border border-yellow-500/20">
                    Editable - This will be posted
                  </span>
                </div>
                <textarea
                  value={publicReview}
                  onChange={(e) => setPublicReview(e.target.value)}
                  className="flex-1 w-full p-4 bg-muted/50 rounded-md font-mono text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Review content..."
                />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 prose prose-sm max-w-none dark:prose-invert">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
                  <h3 className="font-medium m-0">
                    Detailed Internal Analysis
                  </h3>
                  <span className="text-xs text-muted-foreground bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full border border-blue-500/20">
                    Read Only - Private
                  </span>
                </div>
                <div className="whitespace-pre-wrap font-mono text-sm bg-muted/30 p-4 rounded-md">
                  {internalAnalysis}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onPost();
              onClose();
            }}
            disabled={isPosting}
            className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isPosting ? "Posting..." : "Post Review to GitHub"}
            {!isPosting && <ExternalLink className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
