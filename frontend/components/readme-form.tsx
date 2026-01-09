"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  FileText,
  Code,
  Layers,
  MessageSquare,
  Loader2,
  RotateCcw,
  Wand2,
} from "lucide-react";
import {
  ReadmeCreateRequest,
  createReadmeJob,
  pollJobStatus,
} from "@/lib/api";

interface ReadmeFormProps {
  onReadmeGenerated: (readme: string) => void;
  onGenerating: (isGenerating: boolean) => void;
}

interface FormData {
  project_name: string;
  tech_stack: string;
  languages: string;
  description: string;
}

const initialFormData: FormData = {
  project_name: "",
  tech_stack: "",
  languages: "",
  description: "",
};

export function ReadmeForm({ onReadmeGenerated, onGenerating }: ReadmeFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setError(null);
    onReadmeGenerated("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    onGenerating(true);

    try {
      const requestData: ReadmeCreateRequest = {
        project_name: formData.project_name,
        tech_stack: formData.tech_stack,
        languages: formData.languages,
        description: formData.description,
      };

      const job = await createReadmeJob(requestData);

      const completedJob = await pollJobStatus(job.job_id, (update) => {
        if (update.prompt) {
          onReadmeGenerated(update.prompt);
        }
      });

      if (completedJob.status === "completed" && completedJob.prompt) {
        onReadmeGenerated(completedJob.prompt);
      } else if (completedJob.status === "failed") {
        setError(completedJob.error || "Failed to generate README");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
      onGenerating(false);
    }
  };

  const isFormValid =
    formData.project_name.trim() &&
    formData.tech_stack.trim() &&
    formData.languages.trim() &&
    formData.description.trim();

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
            <Wand2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">README Generator</h2>
            <p className="text-sm text-muted-foreground">
              Fill in the details to generate your README
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <Card className="border-2 transition-colors focus-within:border-violet-500/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                  <FileText className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Project Name</CardTitle>
                  <CardDescription>
                    What&apos;s your project called?
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Input
                name="project_name"
                value={formData.project_name}
                onChange={handleInputChange}
                placeholder="e.g., My Awesome Project"
                className="text-base"
                disabled={isLoading}
              />
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card className="border-2 transition-colors focus-within:border-violet-500/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Layers className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Tech Stack</CardTitle>
                  <CardDescription>
                    Frameworks and tools you&apos;re using
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Input
                name="tech_stack"
                value={formData.tech_stack}
                onChange={handleInputChange}
                placeholder="e.g., React, Node.js, PostgreSQL, Docker"
                className="text-base"
                disabled={isLoading}
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["React", "Next.js", "Node.js", "Express", "PostgreSQL", "MongoDB", "Docker"].map(
                  (tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80 transition-colors"
                      onClick={() => {
                        if (!isLoading) {
                          const current = formData.tech_stack;
                          const newValue = current
                            ? `${current}, ${tech}`
                            : tech;
                          setFormData((prev) => ({
                            ...prev,
                            tech_stack: newValue,
                          }));
                        }
                      }}
                    >
                      + {tech}
                    </Badge>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Languages */}
          <Card className="border-2 transition-colors focus-within:border-violet-500/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                  <Code className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Languages</CardTitle>
                  <CardDescription>
                    Programming languages in your project
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Input
                name="languages"
                value={formData.languages}
                onChange={handleInputChange}
                placeholder="e.g., TypeScript, Python, Go"
                className="text-base"
                disabled={isLoading}
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["TypeScript", "JavaScript", "Python", "Go", "Rust", "Java", "C++"].map(
                  (lang) => (
                    <Badge
                      key={lang}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80 transition-colors"
                      onClick={() => {
                        if (!isLoading) {
                          const current = formData.languages;
                          const newValue = current
                            ? `${current}, ${lang}`
                            : lang;
                          setFormData((prev) => ({
                            ...prev,
                            languages: newValue,
                          }));
                        }
                      }}
                    >
                      + {lang}
                    </Badge>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="border-2 transition-colors focus-within:border-violet-500/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                  <MessageSquare className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Description</CardTitle>
                  <CardDescription>
                    Tell us about your project in detail
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your project's purpose, key features, how it works, and any specific sections you want in the README..."
                className="min-h-[120px] text-base resize-none"
                disabled={isLoading}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                💡 Tip: The more detail you provide, the better your README will be!
              </p>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="py-3">
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="flex-1 gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate README
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
