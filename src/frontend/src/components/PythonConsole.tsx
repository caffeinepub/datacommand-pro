import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  type PythonSnippet,
  generateId,
  loadPythonSnippets,
  savePythonSnippets,
} from "@/types";
import {
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  FolderOpen,
  Play,
  Save,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const DEFAULT_PYTHON = `# DataCommand Pro — Python Console
import pandas as pd
import numpy as np

# Sample data analysis
data = {
    'month': ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    'revenue': [45200, 52100, 48700, 61300, 58900],
    'cost': [28100, 31200, 29800, 35600, 33400]
}

df = pd.DataFrame(data)
df['profit'] = df['revenue'] - df['cost']
df['margin'] = (df['profit'] / df['revenue'] * 100).round(2)

print(df.to_string(index=False))
print(f"Total Revenue: \${df['revenue'].sum():,}")
print(f"Total Profit:  \${df['profit'].sum():,}")
print(f"Avg Margin:    {df['margin'].mean():.1f}%")`;

const SIMULATED_OUTPUT = `[DataCommand Pro] Python Simulation Mode
>>> Executing snippet...

 month  revenue   cost  profit  margin
   Jan    45200  28100   17100   37.83
   Feb    52100  31200   20900   40.11
   Mar    48700  29800   18900   38.81
   Apr    61300  35600   25700   41.92
   May    58900  33400   25500   43.30

Total Revenue: $266,200
Total Profit:  $108,100
Avg Margin:    40.4%

Execution completed in 0.18s
[Done] - Simulation mode active`;

export default function PythonConsole() {
  const [code, setCode] = useState(DEFAULT_PYTHON);
  const [snippetName, setSnippetName] = useState("");
  const [snippets, setSnippets] = useState<PythonSnippet[]>(loadPythonSnippets);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleRun = async () => {
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }
    setIsRunning(true);
    setOutput(null);
    await new Promise((r) => setTimeout(r, 700));
    setOutput(SIMULATED_OUTPUT);
    setIsRunning(false);
    toast.success("Code executed (simulation)");
  };

  const handleSave = () => {
    const name = snippetName.trim();
    if (!name) {
      toast.error("Please enter a snippet name");
      return;
    }
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }
    const newSnippet: PythonSnippet = {
      id: generateId(),
      name,
      code,
      description: "",
      createdAt: new Date().toISOString(),
    };
    const updated = [newSnippet, ...snippets];
    setSnippets(updated);
    savePythonSnippets(updated);
    setSnippetName("");
    toast.success(`"${name}" saved`);
  };

  const handleDelete = (id: string) => {
    const updated = snippets.filter((s) => s.id !== id);
    setSnippets(updated);
    savePythonSnippets(updated);
    toast.success("Snippet deleted");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast.success("Copied to clipboard");
  };

  const handleClear = () => {
    setCode("");
    setOutput(null);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 md:px-8 py-5 border-b border-border bg-card">
        <div className="w-9 h-9 rounded-lg bg-green-500/15 border border-green-500/30 flex items-center justify-center">
          <Code2 className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-foreground">
            Python Console
          </h1>
          <p className="text-xs text-muted-foreground">
            Write and simulate Python code execution
          </p>
        </div>
        <div className="ml-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-400">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            Simulation Mode
          </span>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Editor + Output */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 px-4 md:px-6 py-3 border-b border-border bg-card/50">
            <Button
              data-ocid="python.run.button"
              onClick={handleRun}
              disabled={isRunning}
              size="sm"
              className="bg-green-600 hover:bg-green-500 text-white font-semibold"
            >
              <Play className="w-3.5 h-3.5 mr-1.5" />
              {isRunning ? "Executing..." : "Run Code"}
            </Button>
            <div className="flex items-center gap-2 ml-auto">
              <Input
                data-ocid="python.snippet.name.input"
                placeholder="Snippet name..."
                value={snippetName}
                onChange={(e) => setSnippetName(e.target.value)}
                className="h-8 text-xs w-40"
              />
              <Button
                data-ocid="python.save.button"
                onClick={handleSave}
                size="sm"
                variant="outline"
                className="h-8"
              >
                <Save className="w-3.5 h-3.5 mr-1" /> Save
              </Button>
              <Button
                onClick={handleCopy}
                size="sm"
                variant="ghost"
                className="h-8"
              >
                {copiedCode ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </Button>
              <Button
                data-ocid="python.clear.button"
                onClick={handleClear}
                size="sm"
                variant="ghost"
                className="h-8"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Code editor */}
          <div className="flex-1 min-h-0 p-4 md:p-6 flex flex-col gap-4">
            <textarea
              data-ocid="python.editor.textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="code-editor flex-1 min-h-[240px] w-full rounded-xl p-4 text-sm font-mono outline-none resize-none border border-border/40 focus:border-green-500/60 transition-colors"
              spellCheck={false}
              placeholder="# Write your Python code here..."
            />

            {/* Output console */}
            <AnimatePresence>
              {output && (
                <motion.div
                  key="output"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl overflow-hidden border border-border"
                >
                  <div className="flex items-center justify-between px-4 py-2.5 bg-card border-b border-border">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-green-400" />
                      <span className="text-xs font-semibold text-foreground">
                        Output Console
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOutput(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="output-console p-4 max-h-52 overflow-auto whitespace-pre">
                    {output}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Note */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
              <Terminal className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Simulation Mode:</strong>{" "}
                Python runs as a client-side simulation. Connect a real Python
                backend for live execution, library support, and file access.
              </p>
            </div>
          </div>
        </div>

        {/* Saved snippets sidebar */}
        <div className="w-72 flex-shrink-0 border-l border-border bg-card hidden lg:flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Saved Snippets ({snippets.length})
            </p>
          </div>
          <ScrollArea className="flex-1">
            {snippets.length === 0 ? (
              <div
                data-ocid="python.saved.empty_state"
                className="flex flex-col items-center justify-center h-40 text-center px-4"
              >
                <p className="text-xs text-muted-foreground">
                  No saved snippets yet.
                </p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {snippets.map((snippet, i) => (
                  <div
                    key={snippet.id}
                    data-ocid={`saved.item.${i + 1}`}
                    className="group rounded-lg border border-border bg-background p-3 hover:border-green-500/40 transition-all"
                  >
                    <p className="text-sm font-medium text-foreground truncate">
                      {snippet.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                      {snippet.code.split("\n")[0].replace("#", "").trim()}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(snippet.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs flex-1 text-green-400 hover:bg-green-500/10"
                        onClick={() => setCode(snippet.code)}
                      >
                        <FolderOpen className="w-3 h-3 mr-1" /> Load
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        data-ocid={`saved.delete.button.${i + 1}`}
                        className="h-7 text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(snippet.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      <Separator />
      <footer className="px-6 py-3">
        <p className="text-xs text-muted-foreground text-center">
          &copy; {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
