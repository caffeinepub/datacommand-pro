import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type SqlQuery,
  generateId,
  loadSqlQueries,
  saveSqlQueries,
} from "@/types";
import {
  CheckCircle2,
  Clock,
  Copy,
  Database,
  FolderOpen,
  Loader2,
  Play,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const DEFAULT_SQL =
  "-- Data-Analyst SQL Editor — Real SQLite in your browser!\nSELECT\n  e.id,\n  e.name,\n  e.email,\n  d.name AS department,\n  e.salary\nFROM employees e\nJOIN departments d ON e.dept_id = d.id\nORDER BY e.salary DESC;";

const SEED_SQL = `
CREATE TABLE employees (id INTEGER, name TEXT, email TEXT, dept_id INTEGER, salary INTEGER);
INSERT INTO employees VALUES (1,'Alice Johnson','alice@company.com',1,120000);
INSERT INTO employees VALUES (2,'Bob Smith','bob@company.com',2,85000);
INSERT INTO employees VALUES (3,'Carol Davis','carol@company.com',1,115000);
INSERT INTO employees VALUES (4,'David Wilson','david@company.com',3,95000);
INSERT INTO employees VALUES (5,'Eva Martinez','eva@company.com',4,90000);

CREATE TABLE departments (id INTEGER, name TEXT, budget INTEGER);
INSERT INTO departments VALUES (1,'Engineering',500000);
INSERT INTO departments VALUES (2,'Marketing',200000);
INSERT INTO departments VALUES (3,'Finance',300000);
INSERT INTO departments VALUES (4,'Design',150000);

CREATE TABLE sales (id INTEGER, product TEXT, amount REAL, month TEXT);
INSERT INTO sales VALUES (1,'Product A',45200,'Jan');
INSERT INTO sales VALUES (2,'Product B',52100,'Feb');
INSERT INTO sales VALUES (3,'Product A',48700,'Mar');
INSERT INTO sales VALUES (4,'Product C',61300,'Apr');
INSERT INTO sales VALUES (5,'Product B',58900,'May');
`;

type QueryResult = {
  columns: string[];
  rows: (string | number | null)[][];
};

export default function SQLEditor() {
  const [code, setCode] = useState(DEFAULT_SQL);
  const [queryName, setQueryName] = useState("");
  const [queries, setQueries] = useState<SqlQuery[]>(loadSqlQueries);
  const [results, setResults] = useState<QueryResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runTime, setRunTime] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [sqlReady, setSqlReady] = useState(false);
  const [sqlLoading, setSqlLoading] = useState(true);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const dbRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const initSqlJs = (await import("sql.js")).default;
        const SQL = await initSqlJs({
          locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
        });
        if (cancelled) return;
        const db = new SQL.Database();
        db.run(SEED_SQL);
        dbRef.current = db;
        setSqlReady(true);
      } catch (e: any) {
        if (!cancelled) setSqlError(e?.message ?? "Failed to load SQL engine");
      } finally {
        if (!cancelled) setSqlLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRun = async () => {
    if (!code.trim()) {
      toast.error("Please write a query first");
      return;
    }
    if (!dbRef.current) {
      toast.error("SQL engine not ready");
      return;
    }
    setIsRunning(true);
    setResults(null);
    const t0 = performance.now();
    try {
      const res = dbRef.current.exec(code);
      const elapsed = ((performance.now() - t0) / 1000).toFixed(3);
      if (res && res.length > 0) {
        const { columns, values } = res[0];
        setResults({ columns, rows: values });
        setRunTime(elapsed);
        toast.success(`Query executed — ${values.length} rows returned`);
      } else {
        setResults({
          columns: ["Result"],
          rows: [["Query executed successfully (no rows returned)"]],
        });
        setRunTime(elapsed);
        toast.success("Query executed successfully");
      }
    } catch (e: any) {
      toast.error(`SQL Error: ${e?.message}`);
      setSqlError(e?.message);
      setTimeout(() => setSqlError(null), 5000);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSave = () => {
    const name = queryName.trim();
    if (!name) {
      toast.error("Please enter a query name");
      return;
    }
    if (!code.trim()) {
      toast.error("Please write a query first");
      return;
    }
    const newQuery: SqlQuery = {
      id: generateId(),
      name,
      code,
      description: "",
      createdAt: new Date().toISOString(),
    };
    const updated = [newQuery, ...queries];
    setQueries(updated);
    saveSqlQueries(updated);
    setQueryName("");
    toast.success(`"${name}" saved`);
  };

  const handleDelete = (id: string) => {
    const updated = queries.filter((q) => q.id !== id);
    setQueries(updated);
    saveSqlQueries(updated);
    toast.success("Query deleted");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast.success("Copied to clipboard");
  };

  const handleClear = () => {
    setCode("");
    setResults(null);
    setRunTime(null);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 md:px-8 py-5 border-b border-border bg-card">
        <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
          <Database className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-foreground">
            SQL Query Editor
          </h1>
          <p className="text-xs text-muted-foreground">
            Real SQLite engine — live in your browser
          </p>
        </div>
        <div className="ml-auto">
          {sqlLoading && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              Initializing SQL engine...
            </span>
          )}
          {sqlReady && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-xs text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Live
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 px-4 md:px-6 py-3 border-b border-border bg-card/50">
            <Button
              data-ocid="sql.run.button"
              onClick={handleRun}
              disabled={isRunning || !sqlReady}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              {isRunning ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 mr-1.5" />
              )}
              {isRunning ? "Running..." : "Run Query"}
            </Button>
            <div className="flex items-center gap-2 ml-auto">
              <Input
                data-ocid="sql.query.name.input"
                placeholder="Query name..."
                value={queryName}
                onChange={(e) => setQueryName(e.target.value)}
                className="h-8 text-xs w-40"
              />
              <Button
                data-ocid="sql.save.button"
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
            {/* Schema hint */}
            <div className="text-xs text-muted-foreground font-mono bg-muted/20 rounded-lg px-4 py-2 border border-border/40">
              <span className="text-primary font-semibold">Tables:</span>{" "}
              <span className="text-foreground/70">employees</span>
              {" (id, name, email, dept_id, salary) · "}
              <span className="text-foreground/70">departments</span>
              {" (id, name, budget) · "}
              <span className="text-foreground/70">sales</span>
              {" (id, product, amount, month)"}
            </div>

            <textarea
              data-ocid="sql.editor.textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="code-editor flex-1 min-h-[200px] w-full rounded-xl p-4 text-sm font-mono outline-none resize-none border border-border/40 focus:border-primary/60 transition-colors"
              spellCheck={false}
              placeholder="-- Write your SQL query here..."
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  handleRun();
                }
              }}
            />

            {/* SQL Error */}
            <AnimatePresence>
              {sqlError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3"
                >
                  <p
                    className="text-xs font-mono text-destructive"
                    data-ocid="sql.error_state"
                  >
                    {sqlError}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence>
              {results && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl border border-border overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-2.5 bg-card border-b border-border">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-xs font-semibold text-foreground">
                        Results
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {results.rows.length} rows &middot; {runTime}s
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResults(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div
                    data-ocid="sql.results.table"
                    className="overflow-auto max-h-52"
                  >
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          {results.columns.map((col) => (
                            <TableHead
                              key={col}
                              className="font-mono text-xs font-semibold text-primary"
                            >
                              {col}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.rows.map((row) => (
                          <TableRow
                            key={`row-${String(row[0])}`}
                            className="hover:bg-muted/20"
                          >
                            {row.map((cell, ci) => (
                              <TableCell
                                key={results.columns[ci]}
                                className="font-mono text-xs py-2"
                              >
                                {cell === null ? (
                                  <span className="text-muted-foreground italic">
                                    NULL
                                  </span>
                                ) : (
                                  String(cell)
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Saved queries sidebar */}
        <div className="w-72 flex-shrink-0 border-l border-border bg-card hidden lg:flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Saved Queries ({queries.length})
            </p>
          </div>
          <ScrollArea className="flex-1">
            {queries.length === 0 ? (
              <div
                data-ocid="sql.saved.empty_state"
                className="flex flex-col items-center justify-center h-40 text-center px-4"
              >
                <p className="text-xs text-muted-foreground">
                  No saved queries yet.
                </p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {queries.map((query, i) => (
                  <div
                    key={query.id}
                    data-ocid={`saved.item.${i + 1}`}
                    className="group rounded-lg border border-border bg-background p-3 hover:border-primary/40 transition-all"
                  >
                    <p className="text-sm font-medium text-foreground truncate">
                      {query.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                      {query.code.split("\n")[0]}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(query.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs flex-1 text-primary hover:bg-primary/10"
                        onClick={() => setCode(query.code)}
                      >
                        <FolderOpen className="w-3 h-3 mr-1" /> Load
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        data-ocid={`saved.delete.button.${i + 1}`}
                        className="h-7 text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(query.id)}
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
