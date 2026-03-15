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
  Loader2,
  Play,
  Save,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const DEFAULT_PYTHON = [
  "# Data-Analyst Python Console",
  "# Real Python running in your browser via Pyodide!",
  "",
  "data = {",
  "    'month': ['Jan', 'Feb', 'Mar', 'Apr', 'May'],",
  "    'revenue': [45200, 52100, 48700, 61300, 58900],",
  "    'cost': [28100, 31200, 29800, 35600, 33400]",
  "}",
  "",
  "months = data['month']",
  "revenue = data['revenue']",
  "cost = data['cost']",
  "profit = [r - c for r, c in zip(revenue, cost)]",
  "margin = [round(p/r*100, 2) for p, r in zip(profit, revenue)]",
  "",
  'print("Month    Revenue      Cost    Profit   Margin")',
  'print("-" * 50)',
  "for i in range(len(months)):",
  "    r, c, p, m = revenue[i], cost[i], revenue[i]-cost[i], margin[i]",
  '    print(months[i].ljust(8) + str(r).rjust(10) + str(c).rjust(10) + str(p).rjust(10) + (str(m)+"%").rjust(8))',
  "",
  'print("")',
  'print("Total Revenue: $" + str(sum(revenue)))',
  'print("Total Profit:  $" + str(sum(profit)))',
  'print("Avg Margin:    " + str(round(sum(margin)/len(margin),1)) + "%")',
].join("\n");

export default function PythonConsole() {
  const [code, setCode] = useState(DEFAULT_PYTHON);
  const [snippetName, setSnippetName] = useState("");
  const [snippets, setSnippets] = useState<PythonSnippet[]>(loadPythonSnippets);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [pyReady, setPyReady] = useState(false);
  const [pyLoading, setPyLoading] = useState(true);
  const [pyError, setPyError] = useState<string | null>(null);
  const pyodideRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Inject Pyodide script from CDN
        await new Promise<void>((resolve, reject) => {
          if ((window as any).loadPyodide) {
            resolve();
            return;
          }
          const script = document.createElement("script");
          script.src =
            "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js";
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error("Failed to load Pyodide script"));
          document.head.appendChild(script);
        });
        if (cancelled) return;
        const pyodide = await (window as any).loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/",
        });
        if (cancelled) return;
        pyodideRef.current = pyodide;
        setPyReady(true);
      } catch (e: any) {
        if (!cancelled)
          setPyError(e?.message ?? "Failed to load Python engine");
      } finally {
        if (!cancelled) setPyLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRun = async () => {
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }
    if (!pyodideRef.current) {
      toast.error("Python engine not ready");
      return;
    }
    setIsRunning(true);
    setOutput(null);
    try {
      const py = pyodideRef.current;
      // Redirect stdout
      py.runPython(
        "import sys, io; sys.stdout = io.StringIO(); sys.stderr = io.StringIO()",
      );
      try {
        py.runPython(code);
      } catch (e: any) {
        // Get stderr too
        let errOut = "";
        try {
          errOut = py.runPython("sys.stderr.getvalue()");
        } catch (_) {
          /* ignore */
        }
        const msg = errOut || e?.message || "Unknown error";
        setOutput(`Error:\n${msg}`);
        toast.error("Python error — see output");
        setIsRunning(false);
        return;
      }
      const result = py.runPython("sys.stdout.getvalue()");
      setOutput(result || "(no output)");
      toast.success("Code executed successfully");
    } catch (e: any) {
      setOutput(`Error: ${e?.message}`);
      toast.error("Execution failed");
    } finally {
      setIsRunning(false);
    }
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
            Real Python via Pyodide — runs in your browser
          </p>
        </div>
        <div className="ml-auto">
          {pyLoading && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              Initializing Python engine...
            </span>
          )}
          {pyReady && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-xs text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Live
            </span>
          )}
          {pyError && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/30 text-xs text-destructive">
              Failed to load
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 px-4 md:px-6 py-3 border-b border-border bg-card/50">
            <Button
              data-ocid="python.run.button"
              onClick={handleRun}
              disabled={isRunning || !pyReady}
              size="sm"
              className="bg-green-600 hover:bg-green-500 text-white font-semibold"
            >
              {isRunning ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 mr-1.5" />
              )}
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

          <div className="flex-1 min-h-0 p-4 md:p-6 flex flex-col gap-4">
            <textarea
              data-ocid="python.editor.textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="code-editor flex-1 min-h-[240px] w-full rounded-xl p-4 text-sm font-mono outline-none resize-none border border-border/40 focus:border-green-500/60 transition-colors"
              spellCheck={false}
              placeholder="# Write your Python code here..."
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  handleRun();
                }
              }}
            />

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
                  <div className="output-console p-4 max-h-52 overflow-auto whitespace-pre font-mono text-sm">
                    {output}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
              <Terminal className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Tip:</strong> Press{" "}
                <kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono text-xs">
                  Ctrl+Enter
                </kbd>{" "}
                to run. Pyodide supports the full Python standard library. Note:
                Initial load may take 5–10 seconds.
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
