"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/chat-interface";
import { ReadmeViewer } from "@/components/readme-viewer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Github,
  Moon,
  Sun,
  BookOpen,
  Zap,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

export default function Home() {
  const [readme, setReadme] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showChat, setShowChat] = useState(true);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className={`min-h-screen bg-background ${isDarkMode ? "dark" : ""}`}>
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold leading-none">
                README Generator
              </span>
              <span className="text-xs text-muted-foreground">
                AI-Powered Documentation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden gap-2 sm:flex"
              asChild
            >
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                <span>Star on GitHub</span>
              </a>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowChat(!showChat)}
              className="md:hidden"
            >
              {showChat ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex h-[calc(100vh-3.5rem)]">
        {/* Chat Panel */}
        <div
          className={`${
            showChat ? "flex" : "hidden"
          } w-full flex-col border-r md:flex md:w-[450px] lg:w-[500px]`}
        >
          <ChatInterface
            onReadmeGenerated={setReadme}
            onGenerating={setIsGenerating}
          />
        </div>

        {/* README Preview Panel */}
        <div
          className={`${
            showChat ? "hidden" : "flex"
          } flex-1 flex-col md:flex`}
        >
          <ReadmeViewer content={readme} isGenerating={isGenerating} />
        </div>
      </main>

      {/* Feature highlights - shown when no content */}
      {!readme && !isGenerating && (
        <div className="fixed bottom-4 left-1/2 hidden -translate-x-1/2 transform md:block">
          <div className="flex items-center gap-6 rounded-full border bg-background/95 px-6 py-3 shadow-lg backdrop-blur">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-muted-foreground">
                Powered by AI
              </span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">
                Professional READMEs
              </span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2 text-sm">
              <Github className="h-4 w-4 text-purple-500" />
              <span className="text-muted-foreground">
                GitHub Ready
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
