"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  Sparkles,
  FileText,
  Code,
  Layers,
  MessageSquare,
} from "lucide-react";
import {
  Message,
  ReadmeCreateRequest,
  createReadmeJob,
  pollJobStatus,
} from "@/lib/api";

interface ChatInterfaceProps {
  onReadmeGenerated: (readme: string) => void;
  onGenerating: (isGenerating: boolean) => void;
}

interface FormData {
  project_name: string;
  tech_stack: string;
  languages: string;
  description: string;
}

type FormStep = "project_name" | "tech_stack" | "languages" | "description" | "confirm";

const stepInfo: Record<FormStep, { question: string; icon: React.ReactNode; placeholder: string }> = {
  project_name: {
    question: "What's the name of your project?",
    icon: <FileText className="h-4 w-4" />,
    placeholder: "e.g., My Awesome Project",
  },
  tech_stack: {
    question: "What tech stack are you using?",
    icon: <Layers className="h-4 w-4" />,
    placeholder: "e.g., React, Node.js, PostgreSQL, Docker",
  },
  languages: {
    question: "What programming languages are used?",
    icon: <Code className="h-4 w-4" />,
    placeholder: "e.g., TypeScript, Python, Go",
  },
  description: {
    question: "Describe your project in detail:",
    icon: <MessageSquare className="h-4 w-4" />,
    placeholder: "Tell me about your project's purpose, features, and any specific sections you want in the README...",
  },
  confirm: {
    question: "Ready to generate your README?",
    icon: <Sparkles className="h-4 w-4" />,
    placeholder: "Type 'yes' to confirm or 'restart' to start over",
  },
};

const stepOrder: FormStep[] = ["project_name", "tech_stack", "languages", "description", "confirm"];

export function ChatInterface({ onReadmeGenerated, onGenerating }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>("project_name");
  const [formData, setFormData] = useState<FormData>({
    project_name: "",
    tech_stack: "",
    languages: "",
    description: "",
  });
  const [isInitialized, setIsInitialized] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageIdCounter = useRef(0);

  // Initialize with welcome message on client side only
  useEffect(() => {
    if (!isInitialized) {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content:
            "👋 Hello! I'm your README Generator assistant. I'll help you create a professional README for your project.\n\nLet's start by gathering some information about your project. **What's the name of your project?**",
          timestamp: new Date(),
        },
      ]);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (role: "user" | "assistant", content: string) => {
    messageIdCounter.current += 1;
    const newMessage: Message = {
      id: `msg-${messageIdCounter.current}-${Date.now()}`,
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const generateReadme = async () => {
    setIsLoading(true);
    onGenerating(true);

    try {
      const requestData: ReadmeCreateRequest = {
        project_name: formData.project_name,
        tech_stack: formData.tech_stack,
        languages: formData.languages,
        description: formData.description,
      };

      addMessage(
        "assistant",
        "🚀 Starting README generation... This may take a moment."
      );

      const job = await createReadmeJob(requestData);

      addMessage(
        "assistant",
        `⏳ Job created with ID: \`${job.job_id}\`. Processing your request...`
      );

      const completedJob = await pollJobStatus(job.job_id, (update) => {
        if (update.status === "processing" && update.prompt) {
          onReadmeGenerated(update.prompt);
        }
      });

      if (completedJob.status === "completed" && completedJob.prompt) {
        onReadmeGenerated(completedJob.prompt);
        addMessage(
          "assistant",
          "✅ **README generated successfully!** You can see the preview on the right panel. Feel free to copy it or ask me to make changes.\n\nWould you like to generate another README? Just say 'restart' to begin again!"
        );
      } else if (completedJob.status === "failed") {
        addMessage(
          "assistant",
          `❌ Sorry, there was an error generating your README: ${completedJob.error || "Unknown error"}\n\nWould you like to try again? Say 'restart' to begin again.`
        );
      }
    } catch (error) {
      addMessage(
        "assistant",
        `❌ An error occurred: ${error instanceof Error ? error.message : "Unknown error"}\n\nPlease make sure the backend server is running and try again.`
      );
    } finally {
      setIsLoading(false);
      onGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    setInput("");
    addMessage("user", userInput);

    // Handle restart command
    if (userInput.toLowerCase() === "restart") {
      setFormData({
        project_name: "",
        tech_stack: "",
        languages: "",
        description: "",
      });
      setCurrentStep("project_name");
      addMessage(
        "assistant",
        "🔄 Let's start fresh! **What's the name of your project?**"
      );
      return;
    }

    // Process based on current step
    if (currentStep === "confirm") {
      if (userInput.toLowerCase() === "yes" || userInput.toLowerCase() === "y") {
        await generateReadme();
      } else {
        addMessage(
          "assistant",
          "No problem! Type 'restart' to start over, or 'yes' when you're ready to generate."
        );
      }
      return;
    }

    // Update form data and move to next step
    const currentStepIndex = stepOrder.indexOf(currentStep);
    const nextStep = stepOrder[currentStepIndex + 1];

    setFormData((prev) => ({
      ...prev,
      [currentStep]: userInput,
    }));

    if (nextStep === "confirm") {
      const updatedFormData = { ...formData, [currentStep]: userInput };
      addMessage(
        "assistant",
        `Great! Here's what I have:\n\n` +
          `📁 **Project Name:** ${updatedFormData.project_name}\n` +
          `🛠️ **Tech Stack:** ${updatedFormData.tech_stack}\n` +
          `💻 **Languages:** ${updatedFormData.languages}\n` +
          `📝 **Description:** ${updatedFormData.description}\n\n` +
          `Type **'yes'** to generate your README, or **'restart'** to start over.`
      );
    } else {
      const nextStepInfo = stepInfo[nextStep];
      addMessage(
        "assistant",
        `Perfect! ${nextStepInfo.question}`
      );
    }

    setCurrentStep(nextStep);
  };

  const currentStepInfo = stepInfo[currentStep];

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold">README Generator</h2>
            <p className="text-xs text-muted-foreground">
              AI-powered documentation assistant
            </p>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="border-b px-4 py-2">
        <div className="flex items-center gap-2">
          {stepOrder.slice(0, -1).map((step, index) => {
            const isCompleted = stepOrder.indexOf(currentStep) > index;
            const isCurrent = currentStep === step;
            return (
              <div key={step} className="flex items-center gap-2">
                <Badge
                  variant={isCompleted ? "default" : isCurrent ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {index + 1}
                </Badge>
                {index < stepOrder.length - 2 && (
                  <div
                    className={`h-0.5 w-4 ${
                      isCompleted ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar
                className={`h-8 w-8 flex-shrink-0 ${
                  message.role === "user"
                    ? "bg-primary"
                    : "bg-gradient-to-br from-violet-500 to-purple-600"
                } flex items-center justify-center`}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </Avatar>
              <Card
                className={`max-w-[80%] px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </p>
                <p
                  className={`mt-1 text-xs ${
                    message.role === "user"
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </Card>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </Avatar>
              <Card className="bg-muted px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Generating...
                  </span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {currentStepInfo.icon}
            <span>{currentStepInfo.question}</span>
          </div>
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentStepInfo.placeholder}
              className="min-h-[60px] resize-none"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-[60px] w-[60px]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}
