"use client";

import { useState } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Copy,
  Check,
  FileText,
  Eye,
  FileCode,
  Download,
  Sparkles,
  X,
} from "lucide-react";

interface ReadmeViewerProps {
  content: string;
  isGenerating: boolean;
  onContentChange?: (content: string) => void;
}

export function ReadmeViewer({ content, isGenerating, onContentChange }: ReadmeViewerProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "markdown">("preview");

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

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onContentChange) {
      onContentChange(e.target.value);
    }
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* VS Code Style Tab Bar */}
      <div className="flex items-center justify-between border-b bg-muted/30">
        <div className="flex">
          {/* Preview Tab */}
          <button
            onClick={() => setActiveTab("preview")}
            className={`group flex items-center gap-2 border-r px-4 py-2 text-sm transition-colors ${
              activeTab === "preview"
                ? "bg-background text-foreground border-b-2 border-b-violet-500"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>Preview</span>
            {activeTab === "preview" && (
              <div className="ml-1 h-1.5 w-1.5 rounded-full bg-violet-500" />
            )}
          </button>

          {/* Markdown Tab */}
          <button
            onClick={() => setActiveTab("markdown")}
            className={`group flex items-center gap-2 border-r px-4 py-2 text-sm transition-colors ${
              activeTab === "markdown"
                ? "bg-background text-foreground border-b-2 border-b-violet-500"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <FileCode className="h-4 w-4" />
            <span>README.md</span>
            {content && activeTab === "markdown" && (
              <div className="ml-1 h-1.5 w-1.5 rounded-full bg-violet-500" />
            )}
          </button>
        </div>

        {/* Actions */}
        {content && (
          <div className="flex items-center gap-1 px-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-xs"
            >
              {copied ? (
                <>
                  <Check className="mr-1 h-3 w-3 text-green-500" />
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
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-7 px-2 text-xs"
            >
              <Download className="mr-1 h-3 w-3" />
              Download
            </Button>
          </div>
        )}
      </div>

      {/* Status Bar */}
      {(isGenerating || content) && (
        <div className="flex items-center gap-2 border-b bg-muted/20 px-4 py-1.5">
          {isGenerating ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 animate-pulse text-violet-500" />
              <span>Generating README...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3 w-3 text-emerald-500" />
              <span>README.md</span>
              <span className="text-muted-foreground/60">•</span>
              <span>{content.split("\n").length} lines</span>
              <span className="text-muted-foreground/60">•</span>
              <span>{content.length} chars</span>
            </div>
          )}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {content ? (
          activeTab === "preview" ? (
            <ScrollArea className="h-full w-full">
              <div className="p-6 min-w-0">
                <article className="markdown-body max-w-none overflow-x-auto">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({children}) => <h1 className="text-3xl font-bold mt-6 mb-4 pb-2 border-b">{children}</h1>,
                      h2: ({children}) => <h2 className="text-2xl font-semibold mt-6 mb-3 pb-1 border-b">{children}</h2>,
                      h3: ({children}) => <h3 className="text-xl font-semibold mt-5 mb-2">{children}</h3>,
                      h4: ({children}) => <h4 className="text-lg font-semibold mt-4 mb-2">{children}</h4>,
                      p: ({children}) => <p className="mb-4 leading-7">{children}</p>,
                      ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                      li: ({children}) => <li className="leading-7">{children}</li>,
                      a: ({href, children}) => <a href={href} className="text-blue-500 hover:text-blue-600 underline underline-offset-2">{children}</a>,
                      code: ({className, children, ...props}) => {
                        const isInline = !className;
                        return isInline ? (
                          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                        ) : (
                          <code className={className} {...props}>{children}</code>
                        );
                      },
                      pre: ({children}) => <pre className="bg-muted border rounded-lg p-4 overflow-x-auto mb-4 text-sm">{children}</pre>,
                      blockquote: ({children}) => <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground mb-4">{children}</blockquote>,
                      table: ({children}) => <div className="overflow-x-auto mb-4"><table className="min-w-full border-collapse border">{children}</table></div>,
                      th: ({children}) => <th className="border bg-muted px-3 py-2 text-left font-semibold">{children}</th>,
                      td: ({children}) => <td className="border px-3 py-2">{children}</td>,
                      hr: () => <hr className="my-6 border-t" />,
                      img: ({src, alt}) => <img src={src} alt={alt} className="max-w-full h-auto rounded-lg my-4" />,
                      strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                      em: ({children}) => <em className="italic">{children}</em>,
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </article>
              </div>
            </ScrollArea>
          ) : (
            <ScrollArea className="h-full w-full">
              <div className="relative h-full min-h-[500px]">
                <Textarea
                  value={content}
                  onChange={handleContentChange}
                  className="absolute inset-0 h-full w-full resize-none rounded-none border-0 bg-[#1e1e1e] font-mono text-sm leading-6 text-[#d4d4d4] focus-visible:ring-0 focus-visible:ring-offset-0 p-4"
                  style={{
                    fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                    minHeight: "100%",
                  }}
                  spellCheck={false}
                />
              </div>
            </ScrollArea>
          )
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No README yet</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Fill in the form on the left to generate your README.
              The preview will appear here in real-time.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Badge variant="secondary">📁 Project Info</Badge>
              <Badge variant="secondary">🛠️ Tech Stack</Badge>
              <Badge variant="secondary">💻 Languages</Badge>
              <Badge variant="secondary">📝 Description</Badge>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar - VS Code style */}
      {content && (
        <div className="flex items-center justify-between border-t bg-[#007acc] px-3 py-1 text-xs text-white">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <FileCode className="h-3 w-3" />
              Markdown
            </span>
            <span>UTF-8</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{content.split(/\s+/).filter(Boolean).length} words</span>
            <span>Ln {content.split("\n").length}, Col 1</span>
          </div>
        </div>
      )}
    </div>
  );
}
