"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Check,
  FileText,
  Eye,
  Code,
  Download,
  Sparkles,
} from "lucide-react";

interface ReadmeViewerProps {
  content: string;
  isGenerating: boolean;
}

export function ReadmeViewer({ content, isGenerating }: ReadmeViewerProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");

  const handleCopy = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold">README Preview</h2>
            <p className="text-xs text-muted-foreground">
              {isGenerating ? (
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  Generating...
                </span>
              ) : content ? (
                "Live preview"
              ) : (
                "Waiting for content"
              )}
            </p>
          </div>
        </div>

        {content && (
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex rounded-lg border p-1">
              <Button
                variant={viewMode === "preview" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2"
                onClick={() => setViewMode("preview")}
              >
                <Eye className="mr-1 h-3 w-3" />
                Preview
              </Button>
              <Button
                variant={viewMode === "raw" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2"
                onClick={() => setViewMode("raw")}
              >
                <Code className="mr-1 h-3 w-3" />
                Raw
              </Button>
            </div>

            {/* Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-8"
            >
              {copied ? (
                <>
                  <Check className="mr-1 h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-3 w-3" />
                  Copy
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="h-8"
            >
              <Download className="mr-1 h-3 w-3" />
              Download
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {content ? (
          <div className="p-6">
            {viewMode === "preview" ? (
              <article className="markdown-body max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </article>
            ) : (
              <pre className="whitespace-pre-wrap rounded-lg border bg-muted p-4 font-mono text-sm">
                {content}
              </pre>
            )}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No README yet</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Start a conversation on the left panel to generate your README.
              The preview will appear here in real-time as it&apos;s being
              generated.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Badge variant="secondary">📁 Project Info</Badge>
              <Badge variant="secondary">🛠️ Tech Stack</Badge>
              <Badge variant="secondary">💻 Languages</Badge>
              <Badge variant="secondary">📝 Description</Badge>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Footer stats */}
      {content && (
        <div className="border-t px-4 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>{content.split("\n").length} lines</span>
              <span>{content.length} characters</span>
              <span>{content.split(/\s+/).length} words</span>
            </div>
            <Badge variant="outline" className="text-xs">
              Markdown
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
